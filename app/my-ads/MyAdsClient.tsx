'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FiPlus, FiRefreshCw, FiPackage, FiTag, FiArrowLeft } from 'react-icons/fi';
import { toast } from 'sonner';

import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '@/src/components/ui/Container';
import { MyAdCard } from '@/src/components/myads/MyAdsCard';
import { MyAdsSkeleton } from '@/src/components/myads/MyAdsSkeleton';
import { ConfirmDialog } from '@/src/components/myads/ConfirmDialog';

import {
  getMyAds,
  markAsSold,
  deleteProduct,
  assignAdToFeaturedPlan,
  MyAdItem,
} from '@/src/api/services/MyAdsApi';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';
import { se } from 'date-fns/locale';
import { EditAdModal } from '@/src/components/myads/EditAdModal';

export default function MyAdsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // State
  const [ads, setAds] = useState<MyAdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<{ id: number; type: string } | null>(null);
  const [featureLoading, setFeatureLoading] = useState<number | null>(null);

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'sold' | 'delete';
    productId: number;
  }>({ open: false, type: 'sold', productId: 0 });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);

  // Feature flow
  const [selectedPlan, setSelectedPlan] = useState<{
    planReqId: number;
    planTitle: string;
  } | null>(null);
  const [pendingFeatureProductId, setPendingFeatureProductId] = useState<number | null>(null);
  const [featureConfirm, setFeatureConfirm] = useState<{
    open: boolean;
    productId: number;
    planReqId: number;
    planTitle: string;
  }>({ open: false, productId: 0, planReqId: 0, planTitle: '' });

  // Check for returning plan selection
  useEffect(() => {
    const planReqId = searchParams.get('planReqId');
    const planTitle = searchParams.get('planTitle');

    if (planReqId && planTitle) {
      const id = parseInt(planReqId);

      if (pendingFeatureProductId) {
        setFeatureConfirm({
          open: true,
          productId: pendingFeatureProductId,
          planReqId: id,
          planTitle,
        });
      } else {
        setSelectedPlan({ planReqId: id, planTitle });
        toast.info('Plan Selected ✅', {
          description: `"${planTitle}" is ready. Tap Feature on any ad to apply.`,
        });
      }

      // Clean URL
      window.history.replaceState(null, '', '/my-ads');
    }
  }, [searchParams, pendingFeatureProductId]);

  // Fetch ads
  const fetchAds = useCallback(async () => {
    if (!user?.userId) return;
    setLoading(true);
    const data = await getMyAds(user.userId);
    setAds(data);
    setLoading(false);
  }, [user?.userId]);

  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.userId) {
      fetchAds();
    } else if (!authLoading && !isAuthenticated) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, user?.userId, fetchAds]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAds();
    setRefreshing(false);
  };

  // Handlers
  const handleView = (id: number) => {
    router.push(`/product/${id}`);
  };

  const handleEdit = (id: number) => {
    // router.push(`${ROUTES.ADD_POST}?edit=${id}`);
    setEditProductId(id);
    setEditModalOpen(true);
  };

  const handleMarkSoldClick = (id: number) => {
    setConfirmDialog({ open: true, type: 'sold', productId: id });
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ open: true, type: 'delete', productId: id });
  };

  const handleConfirmAction = async () => {
    const { type, productId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    setActionLoading({ id: productId, type });

    try {
      if (type === 'sold') {
        const success = await markAsSold(productId);
        if (success) {
          setAds((prev) =>
            prev.map((ad) =>
              ad.productId === productId ? { ...ad, markAsSold: true, enable: false } : ad
            )
          );
        }
      } else if (type === 'delete') {
        const success = await deleteProduct(productId);
        if (success) {
          setAds((prev) => prev.filter((ad) => ad.productId !== productId));
        }
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Feature ad flow
  const handleFeatureClick = (productId: number, title: string) => {
    if (selectedPlan) {
      setFeatureConfirm({
        open: true,
        productId,
        planReqId: selectedPlan.planReqId,
        planTitle: selectedPlan.planTitle,
      });
      return;
    }

    setPendingFeatureProductId(productId);
    router.push(`/my-ads/my-packages?selectMode=true&productId=${productId}&productTitle=${encodeURIComponent(title)}`);
  };

  const executeFeature = async () => {
    const { productId, planReqId } = featureConfirm;
    if (!user?.userId) return;

    setFeatureConfirm((prev) => ({ ...prev, open: false }));
    setFeatureLoading(productId);

    const result = await assignAdToFeaturedPlan({
      planReqId,
      memberId: user.userId,
      productId,
    });

    if (result.success) {
      setAds((prev) =>
        prev.map((ad) => (ad.productId === productId ? { ...ad, isFeatured: true } : ad))
      );
      toast.success('Featured Successfully! 🌟', { description: result.message });
    } else {
      toast.error('Failed', { description: result.message });
    }

    setFeatureLoading(null);
    setPendingFeatureProductId(null);
    setSelectedPlan(null);
  };

  // Stats
  const totalAds = ads.length;
  const activeAds = ads.filter((a) => !a.markAsSold && a.enable).length;
  const soldAds = ads.filter((a) => a.markAsSold).length;
  const featuredAds = ads.filter((a) => a.isFeatured && !a.markAsSold).length;
  const pendingAds = ads.filter((a) => !a.markAsSold && !a.enable).length;

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <>
        <Navbar variant="solid" showSearch={false} />
        <div className="pt-24 min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-[#003049] mb-2">Login Required</h2>
            <p className="text-gray-500 mb-6">Please login to view your ads</p>
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c]"
            >
              Login Now
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar variant="solid" showSearch={false} />

      <main className="pt-24 pb-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003049] to-[#004d6d] py-8">
          <Container>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">My Ads</h1>
                  <p className="text-white/60 text-sm">{totalAds} ads posted</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white disabled:opacity-50"
                >
                  <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={() => router.push(ROUTES.ADD_POST)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold hover:bg-[#ea580c]"
                >
                  <FiPlus className="w-5 h-5" />
                  Post Ad
                </button>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-3 mt-5">
              <Link
                href="/my-ads/my-packages"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <FiPackage className="w-4 h-4" />
                My Packages
              </Link>
              <Link
                href="/my-ads/view-packages"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium text-sm transition-colors"
              >
                <FiTag className="w-4 h-4" />
                View Packages
              </Link>
            </div>
          </Container>
        </div>

        <Container className="py-6">
          {/* Stats */}
          {!loading && ads.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              {[
                { label: 'Total', value: totalAds, color: 'bg-[#003049]' },
                { label: 'Active', value: activeAds, color: 'bg-green-500' },
                { label: 'Pending', value: pendingAds, color: 'bg-yellow-500' },
                { label: 'Featured', value: featuredAds, color: 'bg-purple-500' },
                { label: 'Sold', value: soldAds, color: 'bg-gray-500' },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`${stat.color} text-white p-4 rounded-xl text-center`}
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-white/80 text-xs font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          )}

          {/* Selected Plan Banner */}
          {selectedPlan && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                  <FiTag className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-purple-800">{selectedPlan.planTitle} Selected</p>
                  <p className="text-purple-600 text-sm">Tap Feature on any ad to apply</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="text-purple-500 hover:text-purple-700 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Ads List */}
          {loading ? (
            <MyAdsSkeleton />
          ) : ads.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FiTag className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No Ads Yet</h3>
              <p className="text-gray-500 mb-6">Start selling by posting your first ad!</p>
              <button
                onClick={() => router.push(ROUTES.ADD_POST)}
                className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c] inline-flex items-center gap-2"
              >
                <FiPlus className="w-5 h-5" />
                Post New Ad
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {ads.map((ad, index) => (
                <motion.div
                  key={ad.productId}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <MyAdCard
                    ad={ad}
                    onView={handleView}
                    onEdit={handleEdit}
                    onMarkSold={handleMarkSoldClick}
                    onFeature={handleFeatureClick}
                    onDelete={handleDeleteClick}
                    actionLoading={actionLoading}
                    featureLoading={featureLoading}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </Container>
      </main>


      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === 'sold' ? 'Mark as Sold' : 'Delete Ad'}
        message={
          confirmDialog.type === 'sold'
            ? 'This will mark your ad as sold. Continue?'
            : 'This will permanently delete your ad. This cannot be undone.'
        }
        confirmText={confirmDialog.type === 'sold' ? 'Mark Sold' : 'Delete'}
        variant={confirmDialog.type === 'sold' ? 'warning' : 'danger'}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDialog((prev) => ({ ...prev, open: false }))}
      />

      {/* Feature Confirm Dialog */}
      <ConfirmDialog
        open={featureConfirm.open}
        title="Confirm Feature"
        message={`Feature this ad with "${featureConfirm.planTitle}"?`}
        confirmText="Feature Now"
        variant="info"
        onConfirm={executeFeature}
        onCancel={() => {
          setFeatureConfirm((prev) => ({ ...prev, open: false }));
          setPendingFeatureProductId(null);
          setSelectedPlan(null);
        }}
      />

      {/* Edit Modal */}
      {/* Edit Modal */}
<EditAdModal
  open={editModalOpen}
  productId={editProductId}
  onClose={() => {
    setEditModalOpen(false);
    setEditProductId(null);
  }}
  onSaved={() => {
    // Silent refresh after edit
    fetchAds();
  }}
/>
    </>
  );
}