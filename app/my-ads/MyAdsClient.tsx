"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiPlus,
  FiRefreshCw,
  FiTag,
  FiArrowLeft,
  FiTrendingUp,
  FiBarChart2,
  FiAlertCircle,
  FiCheckCircle,
} from "react-icons/fi";
import { toast } from "sonner";

import { Container } from "@/src/components/ui/Container";
import { MyAdCard } from "@/src/components/myads/MyAdsCard";
import { MyAdsSkeleton } from "@/src/components/myads/MyAdsSkeleton";
import { ConfirmDialog } from "@/src/components/myads/ConfirmDialog";

import {
  getMyAds,
  markAsSold,
  deleteProduct,
  assignAdToFeaturedPlan,
  MyAdItem,
} from "@/src/api/services/MyAdsApi";
import { useAuth } from "@/src/context/AuthContext";
import { ROUTES } from "@/src/utils/constants";
import { EditAdModal } from "@/src/components/myads/EditAdModal";

export default function MyAdsClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  // State
  const [ads, setAds] = useState<MyAdItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<{
    id: number;
    type: string;
  } | null>(null);
  const [featureLoading, setFeatureLoading] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 5;
  const [processedPlanQuery, setProcessedPlanQuery] = useState<string | null>(
    null,
  );

  // Dialogs
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: "sold" | "delete";
    productId: number;
  }>({ open: false, type: "sold", productId: 0 });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<number | null>(null);

  // Feature flow
  const [selectedPlan, setSelectedPlan] = useState<{
    planReqId: number;
    planTitle: string;
  } | null>(null);
  const [pendingFeatureProductId, setPendingFeatureProductId] = useState<
    number | null
  >(null);
  const [featureConfirm, setFeatureConfirm] = useState<{
    open: boolean;
    productId: number;
    planReqId: number;
    planTitle: string;
  }>({ open: false, productId: 0, planReqId: 0, planTitle: "" });

  // Check for returning plan selection
  useEffect(() => {
    const planReqId = searchParams.get("planReqId");
    const planTitle = searchParams.get("planTitle");
    const marker = `${planReqId}-${planTitle}`;

    if (planReqId && planTitle && processedPlanQuery !== marker) {
      setProcessedPlanQuery(marker);
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
        toast.info("Plan Selected ✅", {
          description: `"${planTitle}" is ready. Tap Feature on any ad to apply.`,
        });
      }

      // Clean URL
      window.history.replaceState(null, "", "/my-ads");
    }
  }, [searchParams, pendingFeatureProductId, processedPlanQuery]);

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
    router.push(`/product/${id}?isgeneral=false`);
  };

  const handleEdit = (id: number) => {
    // router.push(`${ROUTES.ADD_POST}?edit=${id}`);
    setEditProductId(id);
    setEditModalOpen(true);
  };

  const handleMarkSoldClick = (id: number) => {
    setConfirmDialog({ open: true, type: "sold", productId: id });
  };

  const handleDeleteClick = (id: number) => {
    setConfirmDialog({ open: true, type: "delete", productId: id });
  };

  const handleConfirmAction = async () => {
    const { type, productId } = confirmDialog;
    setConfirmDialog((prev) => ({ ...prev, open: false }));
    setActionLoading({ id: productId, type });

    try {
      if (type === "sold") {
        const success = await markAsSold(productId);
        if (success) {
          setAds((prev) =>
            prev.map((ad) =>
              ad.productId === productId
                ? { ...ad, markAsSold: true, enable: false }
                : ad,
            ),
          );
        }
      } else if (type === "delete") {
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
    router.push(
      `/my-ads/my-packages?selectMode=true&productId=${productId}&productTitle=${encodeURIComponent(title)}`,
    );
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
        prev.map((ad) =>
          ad.productId === productId ? { ...ad, isFeatured: true } : ad,
        ),
      );
      toast.success("Featured Successfully! 🌟", {
        description: result.message,
      });
    } else {
      toast.error("Failed", { description: result.message });
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
  const totalPages = Math.max(1, Math.ceil(ads.length / PAGE_SIZE));
  const paginatedAds = ads.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  // Not logged in
  if (!authLoading && !isAuthenticated) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center px-6">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-4xl">🔒</span>
            </div>
            <h2 className="text-2xl font-bold text-[#003049] mb-2">
              Login Required
            </h2>
            <p className="text-gray-500 mb-6">Please login to view your ads</p>
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c] cursor-pointer"
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
      <main className="py-28 min-h-screen bg-gray-100">
        <Container className="py-4">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2 hover:bg-gray-50"
              >
                <FiArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Ads</h1>
                <p className="text-sm text-gray-500">
                  Manage your listing performance and activity
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="cursor-pointer rounded-lg border border-gray-200 bg-white p-2.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${refreshing ? "animate-spin" : ""}`}
                />
              </button>
              <button
                onClick={() => router.push(ROUTES.ADD_POST)}
                className="cursor-pointer rounded-lg bg-[#F97316] px-4 py-2.5 font-semibold text-white hover:bg-[#ea580c]"
              >
                <span className="inline-flex items-center gap-2">
                  <FiPlus className="w-4 h-4" />
                  Post Ad
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <section className="lg:col-span-8">
              {/* Selected Plan Banner */}
              {selectedPlan && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <FiTag className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-800">
                        {selectedPlan.planTitle} Selected
                      </p>
                      <p className="text-purple-600 text-sm">
                        Tap Feature on any ad to apply
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedPlan(null)}
                    className="cursor-pointer text-purple-500 hover:text-purple-700 text-sm font-medium"
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
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    No Ads Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start selling by posting your first ad!
                  </p>
                  <button
                    onClick={() => router.push(ROUTES.ADD_POST)}
                    className="cursor-pointer bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c] inline-flex items-center gap-2"
                  >
                    <FiPlus className="w-5 h-5" />
                    Post New Ad
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedAds.map((ad, index) => (
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
              {/* Pagination */}
              {!loading && ads.length > PAGE_SIZE && (
                <div className="mt-5 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`h-8 w-8 rounded-md text-sm font-semibold cursor-pointer ${
                          page === currentPage
                            ? "bg-[#003049] text-white"
                            : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="lg:col-span-4 space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-[#b06a2b] to-[#003049] p-5 text-white shadow-lg">
                <p className="text-xs uppercase tracking-wide text-white/70">
                  Premium Seller
                </p>
                <h3 className="mt-1 text-2xl font-bold">
                  Boost your sale by up to 10x!
                </h3>
                <p className="mt-2 text-sm text-white/80">
                  Manage your listing, track performance and increase your item
                  reach.
                </p>
                <ul className="mt-3 space-y-1 text-xs text-white/85">
                  <li className="inline-flex items-center gap-1">
                    <FiTrendingUp className="w-3.5 h-3.5" /> Higher visibility
                    in search
                  </li>
                  <li className="inline-flex items-center gap-1">
                    <FiTag className="w-3.5 h-3.5" /> Featured ad placements
                  </li>
                  <li className="inline-flex items-center gap-1">
                    <FiCheckCircle className="w-3.5 h-3.5" /> Faster buyer
                    response
                  </li>
                </ul>
                <button
                  onClick={() => router.push("/my-ads/view-packages")}
                  className="mt-4 w-full cursor-pointer rounded-lg bg-[#F97316] py-2.5 text-sm font-bold text-white hover:bg-[#ea580c]"
                >
                  View Packages
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <FiBarChart2 className="w-4 h-4 text-[#003049]" />
                  <h4 className="font-bold text-gray-800">Quick Stats</h4>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Total Views</p>
                    <p className="text-xl font-bold text-[#003049]">
                      {ads
                        .reduce((acc, item) => acc + (item.viewsCount || 0), 0)
                        .toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Published Ads</p>
                    <p className="text-xl font-bold text-green-600">
                      {activeAds}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3">
                    <p className="text-xs text-gray-500">Pending Review</p>
                    <p className="text-xl font-bold text-amber-600">
                      {pendingAds}
                    </p>
                    {pendingAds > 0 && (
                      <p className="mt-1 inline-flex items-center gap-1 text-xs text-amber-700">
                        <FiAlertCircle className="w-3.5 h-3.5" />
                        Ads with `enable=false` are shown as pending.
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push("/my-ads/my-packages")}
                  className="mt-4 w-full cursor-pointer rounded-lg border border-[#003049] py-2.5 text-sm font-semibold text-[#003049] hover:bg-[#003049] hover:text-white"
                >
                  My Packages
                </button>
              </div>
            </aside>
          </div>
        </Container>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.type === "sold" ? "Mark as Sold" : "Delete Ad"}
        message={
          confirmDialog.type === "sold"
            ? "This will mark your ad as sold. Continue?"
            : "This will permanently delete your ad. This cannot be undone."
        }
        confirmText={confirmDialog.type === "sold" ? "Mark Sold" : "Delete"}
        variant={confirmDialog.type === "sold" ? "warning" : "danger"}
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
