'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiStar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiCreditCard,
  FiTag,
} from 'react-icons/fi';

import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';
import {
  getMyPackages,
  FeaturedPlan,
  formatPrice,
} from '@/src/api/services/PackagesApi';
import { cn } from '@/src/utils/cn';

export default function MyPackagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user, isLoading: authLoading } = useAuth();

  const isSelectMode = searchParams.get('selectMode') === 'true';
  const productTitle = searchParams.get('productTitle') || 'your ad';

  const [packages, setPackages] = useState<FeaturedPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'expired'>('active');

  const fetchPackages = useCallback(async () => {
    const response = await getMyPackages();
    if (response.success) setPackages(response.data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!authLoading && isAuthenticated) fetchPackages();
    else if (!authLoading) setLoading(false);
  }, [authLoading, isAuthenticated, fetchPackages]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPackages();
    setRefreshing(false);
  };

  const handleSelectPlan = (plan: FeaturedPlan) => {
    if (plan.PlanStatus === 'Expired') return;
    router.push(`/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`);
  };

  const handleUsePlan = (plan: FeaturedPlan) => {
    router.push(`/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`);
  };

  const filtered = packages.filter((p) =>
    activeTab === 'active' ? p.PlanStatus !== 'Expired' : p.PlanStatus === 'Expired'
  );
  const activeCount = packages.filter((p) => p.PlanStatus !== 'Expired').length;
  const expiredCount = packages.filter((p) => p.PlanStatus === 'Expired').length;

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
            <p className="text-gray-500 mb-6">Please login to view your packages</p>
            <button onClick={() => router.push(ROUTES.LOGIN)} className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold">
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
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-lg">
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {isSelectMode ? 'Select a Plan' : 'My Packages'}
                  </h1>
                  <p className="text-white/60 text-sm">
                    {isSelectMode ? `Feature: ${productTitle}` : 'Manage your purchased plans'}
                  </p>
                </div>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="p-2.5 bg-white/10 rounded-xl text-white disabled:opacity-50">
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Select Mode Banner */}
            {isSelectMode && (
              <div className="mt-4 bg-purple-600 rounded-xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <FiStar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">Select an Active Plan</p>
                  <p className="text-white/80 text-xs">Tap on a plan below to feature your ad</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            {packages.length > 0 && (
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setActiveTab('active')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all',
                    activeTab === 'active'
                      ? 'bg-green-600 border-green-500 text-white'
                      : 'bg-white/10 border-white/20 text-white'
                  )}
                >
                  <FiCheckCircle className="w-4 h-4" />
                  Active ({activeCount})
                </button>
                <button
                  onClick={() => setActiveTab('expired')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-semibold transition-all',
                    activeTab === 'expired'
                      ? 'bg-red-600 border-red-500 text-white'
                      : 'bg-white/10 border-white/20 text-white'
                  )}
                >
                  <FiClock className="w-4 h-4" />
                  Expired ({expiredCount})
                </button>
              </div>
            )}
          </Container>
        </div>

        <Container className="py-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse space-y-4">
                  <div className="flex justify-between">
                    <div className="h-6 bg-gray-200 rounded w-48" />
                    <div className="h-6 bg-gray-200 rounded-full w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-3 bg-gray-200 rounded-full w-full" />
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-32" />
                    <div className="h-10 bg-gray-200 rounded-xl w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-6">
                <FiCreditCard className="w-10 h-10 text-[#F97316]" />
              </div>
              <h3 className="text-2xl font-bold text-[#003049] mb-2">No Packages Yet</h3>
              <p className="text-gray-500 mb-8">Purchase a featured plan to boost your ads!</p>
              <button
                onClick={() => router.push('/my-ads/view-packages')}
                className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2"
              >
                <FiTag className="w-5 h-5" />
                View Packages
              </button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <div className={cn('w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6', activeTab === 'active' ? 'bg-green-100' : 'bg-red-100')}>
                {activeTab === 'active' ? <FiCreditCard className="w-10 h-10 text-green-500" /> : <FiClock className="w-10 h-10 text-red-500" />}
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {activeTab === 'active' ? 'No Active Packages' : 'No Expired Packages'}
              </h3>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((plan, index) => {
                const isExpired = plan.PlanStatus === 'Expired';
                const used = plan.TotalProducts - plan.RemainingProducts;
                const usagePercent = (used / plan.TotalProducts) * 100;
                const isSelectable = isSelectMode && !isExpired && plan.RemainingProducts > 0;

                return (
                  <motion.div
                    key={plan.PlanReqID}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <div
                      onClick={() => isSelectable && handleSelectPlan(plan)}
                      className={cn(
                        'bg-white rounded-2xl border overflow-hidden shadow-sm transition-all',
                        isExpired ? 'border-red-200' : 'border-green-200',
                        isSelectable && 'cursor-pointer hover:shadow-md border-purple-400 border-2'
                      )}
                    >
                      {/* Status Banner */}
                      {isSelectMode && (
                        <div className={cn('py-2 px-4 flex items-center justify-center gap-2 text-white text-sm font-semibold', isSelectable ? 'bg-purple-500' : 'bg-gray-400')}>
                          {isSelectable ? <><FiCheckCircle className="w-4 h-4" /> Tap to Select</> : <><FiXCircle className="w-4 h-4" /> Cannot Select</>}
                        </div>
                      )}

                      {!isSelectMode && (
                        <div className={cn('py-2 px-4 flex items-center justify-center gap-2 text-white text-xs font-semibold', isExpired ? 'bg-red-500' : 'bg-green-500')}>
                          {isExpired ? <><FiClock className="w-3.5 h-3.5" /> Expired {plan.DaysPassedSinceExpired} days ago</> : <><FiCheckCircle className="w-3.5 h-3.5" /> Currently Active</>}
                        </div>
                      )}

                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-lg font-bold text-[#003049] flex-1 mr-3">{plan.PlanTitle}</h3>
                          <span className={cn('px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1', isExpired ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600')}>
                            <div className={cn('w-2 h-2 rounded-full', isExpired ? 'bg-red-500' : 'bg-green-500')} />
                            {plan.PlanStatus}
                          </span>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">{plan.PlanDescription}</p>

                        {/* Usage */}
                        <div className={cn('p-3 rounded-xl mb-4', isExpired ? 'bg-red-50' : 'bg-green-50')}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-600 text-sm font-medium">Ads Usage</span>
                            <span className={cn('px-3 py-1 rounded-full text-xs font-bold', isExpired ? 'bg-red-200 text-red-700' : plan.RemainingProducts > 0 ? 'bg-green-200 text-green-700' : 'bg-yellow-200 text-yellow-700')}>
                              {plan.RemainingProducts} Remaining
                            </span>
                          </div>
                          <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden mb-2">
                            <div
                              className={cn('h-full rounded-full transition-all', isExpired ? 'bg-red-500' : plan.RemainingProducts > 0 ? 'bg-green-500' : 'bg-yellow-500')}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                          <p className="text-gray-500 text-xs">
                            <span className="font-bold">{used}</span> of <span className="font-bold">{plan.TotalProducts}</span> ads featured
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div>
                            <p className="text-gray-500 text-xs">Price Paid</p>
                            <p className="text-lg font-bold text-[#003049]">Rs {formatPrice(plan.Price)}</p>
                          </div>

                          {!isSelectMode && (
                            isExpired ? (
                              <button className="px-4 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 hover:bg-[#ea580c]">
                                <FiRefreshCw className="w-4 h-4" /> Renew
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUsePlan(plan)}
                                disabled={plan.RemainingProducts === 0}
                                className={cn('px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-1.5', plan.RemainingProducts === 0 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600')}
                              >
                                <FiStar className="w-4 h-4" />
                                {plan.RemainingProducts === 0 ? 'No Slots' : 'Use Plan'}
                              </button>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </Container>
      </main>

      <Footer />
    </>
  );
}