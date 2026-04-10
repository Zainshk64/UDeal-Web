// src/app/my-packages/page.tsx
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiStar,
  FiArrowRight,
  FiPackage,
  FiZap,
  FiCalendar,
} from 'react-icons/fi';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';
import { FeaturedPlan, formatPrice, getMyPackages } from '@/src/api/services/PackagesApi';
import { cn } from '@/src/utils/cn';

export default function MyPackagesClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

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

  const filtered = useMemo(
    () => packages.filter((p) => (activeTab === 'active' ? p.PlanStatus !== 'Expired' : p.PlanStatus === 'Expired')),
    [packages, activeTab]
  );

  if (!authLoading && !isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-28">
        <Container className="max-w-md">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
              <FiPackage className="h-8 w-8 text-gray-400" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">Login Required</h2>
            <p className="mb-6 text-gray-600">Please login to view your packages</p>
            <button
              onClick={() => router.push(ROUTES.LOGIN)}
              className="w-full rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:shadow-lg active:scale-95"
            >
              Login Now
            </button>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-28">
      <Container className="space-y-6">
        {/* Header Section */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-primary p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">
                  {isSelectMode ? 'Select a Package Plan' : 'My Packages'}
                </h1>
                <p className="mt-2 text-primary-light/90">
                  {isSelectMode
                    ? `Apply package for: ${productTitle}`
                    : 'Manage and use your purchased package plans'}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/my-ads')}
                  className="rounded-xl cursor-pointer border-2 border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
                >
                  Back to Ads
                </button>
                <button
                  onClick={async () => {
                    setRefreshing(true);
                    await fetchPackages();
                    setRefreshing(false);
                  }}
                  className="rounded-xl cursor-pointer border-2 border-white/20 bg-white/10 p-2.5 backdrop-blur-sm transition hover:bg-white/20"
                  aria-label="Refresh packages"
                >
                  <FiRefreshCw className={cn('h-5 w-5', refreshing && 'animate-spin')} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-3">
          <button
            onClick={() => setActiveTab('active')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all',
              activeTab === 'active'
                ? 'bg-primary text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-primary hover:text-primary'
            )}
          >
            <FiCheckCircle className="h-4 w-4" />
            Active Plans ({packages.filter((p) => p.PlanStatus !== 'Expired').length})
          </button>
          <button
            onClick={() => setActiveTab('expired')}
            className={cn(
              'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-all',
              activeTab === 'expired'
                ? 'bg-accent text-white shadow-lg'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-accent hover:text-accent'
            )}
          >
            <FiClock className="h-4 w-4" />
            Expired Plans ({packages.filter((p) => p.PlanStatus === 'Expired').length})
          </button>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-12 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <FiPackage className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No {activeTab} plans found</h3>
            <p className="mt-2 text-gray-600">
              {activeTab === 'active'
                ? 'You have no active packages. Purchase one to get started.'
                : 'You have no expired packages.'}
            </p>
            {activeTab === 'active' && (
              <button
                onClick={() => router.push('/view-packages')}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:shadow-lg active:scale-95"
              >
                <span>View Available Packages</span>
                <FiArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((plan) => {
              const isExpired = plan.PlanStatus === 'Expired';
              const used = plan.TotalProducts - plan.RemainingProducts;
              const usagePercent = (used / plan.TotalProducts) * 100;
              const selectable = isSelectMode && !isExpired && plan.RemainingProducts > 0;

              return (
                <div
                  key={plan.PlanReqID}
                  className={cn(
                    'group overflow-hidden rounded-2xl border-2 bg-white shadow-lg transition-all hover:shadow-xl',
                    selectable && 'cursor-pointer hover:border-primary',
                    isExpired ? 'border-gray-200' : 'border-gray-200 hover:border-primary'
                  )}
                  onClick={() => {
                    if (selectable) {
                      router.push(
                        `/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`
                      );
                    }
                  }}
                >
                  {/* Header */}
                  <div
                    className={cn(
                      'px-6 py-4',
                      isExpired
                        ? 'bg-gray-100'
                        : 'bg-gradient-to-r from-primary/5 to-accent/5'
                    )}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-lg',
                          isExpired ? 'bg-gray-300' : 'bg-primary'
                        )}
                      >
                        <FiZap className="h-5 w-5 text-white" />
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-bold',
                          isExpired
                            ? 'bg-red-100 text-red-700'
                            : 'bg-primary text-white'
                        )}
                      >
                        {plan.PlanStatus}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{plan.PlanTitle}</h3>
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600">
                      {plan.PlanDescription}
                    </p>
                  </div>

                  {/* Content */}
                  <div className="space-y-4 px-6 py-5">
                    {/* Usage Stats */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-700">Usage</span>
                        <span className="text-sm font-bold text-gray-900">
                          {used} of {plan.TotalProducts}
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                        <div
                          className={cn(
                            'h-full transition-all',
                            isExpired ? 'bg-gray-400' : 'bg-primary'
                          )}
                          style={{ width: `${usagePercent}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        {plan.RemainingProducts} remaining
                      </p>
                    </div>

                    {/* Price */}
                    <div className="rounded-lg bg-gray-50 px-4 py-3">
                      <span className="text-xs text-gray-600">Price</span>
                      <p className="text-2xl font-bold text-primary">
                        Rs {formatPrice(plan.Price)}
                      </p>
                    </div>

                    {/* Plan Details */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <FiPackage className="h-4 w-4 text-primary" />
                        <span>{plan.TotalProducts} listings included</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                    {!isSelectMode ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isExpired && plan.RemainingProducts > 0) {
                            router.push(
                              `/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`
                            );
                          }
                        }}
                        disabled={isExpired || plan.RemainingProducts === 0}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all',
                          isExpired || plan.RemainingProducts === 0
                            ? 'cursor-not-allowed bg-gray-300 text-gray-500'
                            : 'bg-primary text-white hover:shadow-lg active:scale-95'
                        )}
                      >
                        <FiStar className="h-4 w-4" />
                        {isExpired || plan.RemainingProducts === 0 ? 'Unavailable' : 'Use Plan'}
                      </button>
                    ) : (
                      <button
                        disabled={!selectable}
                        className={cn(
                          'flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-all',
                          selectable
                            ? 'bg-accent text-white hover:shadow-lg active:scale-95'
                            : 'cursor-not-allowed bg-gray-300 text-gray-500'
                        )}
                      >
                        <FiCheckCircle className="h-4 w-4" />
                        {selectable ? 'Select Plan' : 'Unavailable'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Cards */}
        {/* {filtered.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FiZap,
                title: 'Instant Activation',
                description: 'Use your package immediately',
              },
              {
                icon: FiCheckCircle,
                title: 'Multiple Uses',
                description: 'Apply to multiple listings',
              },
              {
                icon: FiCalendar,
                title: 'Valid Period',
                description: 'Check expiry dates regularly',
              },
            ].map((info, index) => (
              <div
                key={index}
                className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-all"
              >
                <div className="mb-3 inline-flex rounded-lg bg-primary/10 p-2.5">
                  <info.icon className="h-5 w-5 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900">{info.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{info.description}</p>
              </div>
            ))}
          </div>
        )} */}
      </Container>
    </main>
  );
}