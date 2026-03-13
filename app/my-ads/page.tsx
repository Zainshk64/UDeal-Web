'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiPlus } from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { Navbar } from '@/src/components/layout/Navbar';
import { MyAdsCard } from '@/src/components/myads/MyAdsCard';
import { getMyAds, deleteAd, markAsSold, MyAdItem } from '@/src/api/services/MyAdsApi';
import { ROUTES } from '@/src/utils/constants';
import { ProductGridSkeleton } from '@/src/components/loaders/SkeletonLoader';

export default function MyAdsPage() {
  const router = useRouter();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();
  const [ads, setAds] = useState<MyAdItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  // Load my ads
  useEffect(() => {
    const loadAds = async () => {
      if (!user?.userId) return;

      setIsLoading(true);
      try {
        const myAds = await getMyAds(user.userId);
        setAds(myAds);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading && isAuthenticated && user?.userId) {
      loadAds();
    }
  }, [isAuthenticated, authLoading, user?.userId]);

  const handleDelete = async (productId: number) => {
    if (!user?.userId) return;

    setIsActionLoading(true);
    try {
      const success = await deleteAd(productId, user.userId);
      if (success) {
        setAds((prev) => prev.filter((ad) => ad.productId !== productId));
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleMarkAsSold = async (productId: number) => {
    if (!user?.userId) return;

    setIsActionLoading(true);
    try {
      const success = await markAsSold(productId, user.userId);
      if (success) {
        setAds((prev) =>
          prev.map((ad) =>
            ad.productId === productId ? { ...ad, markAsSold: true } : ad
          )
        );
      }
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleEdit = (ad: MyAdItem) => {
    // TODO: Navigate to edit post page with product data
    router.push(`${ROUTES.ADD_POST}?edit=${ad.productId}`);
  };

  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-white" />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="gradient-primary text-white py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold mb-2">My Ads</h1>
                <p className="text-white/90">Manage your listings and track sales</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push(ROUTES.ADD_POST)}
                className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white rounded-lg font-semibold hover:bg-[#d97706] transition-colors"
              >
                <FiPlus className="w-5 h-5" />
                Post New Ad
              </motion.button>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : ads.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FiPlus className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No ads yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start selling by posting your first ad
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push(ROUTES.ADD_POST)}
                  className="px-6 py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-shadow"
                >
                  Post Your First Ad
                </motion.button>
              </motion.div>
            ) : (
              <>
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="bg-gradient-primary text-white p-6 rounded-lg shadow-sm"
                  >
                    <p className="text-white/80 text-sm font-medium mb-1">Total Ads</p>
                    <p className="text-3xl font-bold">{ads.length}</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-blue-500 text-white p-6 rounded-lg shadow-sm"
                  >
                    <p className="text-white/80 text-sm font-medium mb-1">Active Ads</p>
                    <p className="text-3xl font-bold">
                      {ads.filter((a) => !a.markAsSold && a.enable).length}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-red-500 text-white p-6 rounded-lg shadow-sm"
                  >
                    <p className="text-white/80 text-sm font-medium mb-1">Sold</p>
                    <p className="text-3xl font-bold">
                      {ads.filter((a) => a.markAsSold).length}
                    </p>
                  </motion.div>
                </div>

                {/* Ads Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {ads.map((ad, index) => (
                    <motion.div
                      key={ad.productId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <MyAdsCard
                        ad={ad}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onMarkAsSold={handleMarkAsSold}
                        isLoading={isActionLoading}
                      />
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
