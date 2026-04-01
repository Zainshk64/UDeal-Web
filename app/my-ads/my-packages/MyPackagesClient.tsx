'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FiCheckCircle, FiClock, FiRefreshCw, FiStar } from 'react-icons/fi';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-6">
          <h2 className="text-2xl font-bold text-[#003049] mb-2">Login Required</h2>
          <p className="text-gray-500 mb-6">Please login to view your packages</p>
          <button
            onClick={() => router.push(ROUTES.LOGIN)}
            className="cursor-pointer bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold"
          >
            Login Now
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="py-28 min-h-screen bg-gray-100">
      <Container className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isSelectMode ? 'Select a Package Plan' : 'My Packages'}
              </h1>
              <p className="text-sm text-gray-500">
                {isSelectMode ? `Apply package for: ${productTitle}` : 'Manage and use your purchased package plans'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/my-ads')}
                className="cursor-pointer rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium hover:bg-gray-50"
              >
                Back to My Ads
              </button>
              <button
                onClick={async () => {
                  setRefreshing(true);
                  await fetchPackages();
                  setRefreshing(false);
                }}
                className="cursor-pointer rounded-lg border border-gray-200 p-2.5 hover:bg-gray-50"
              >
                <FiRefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setActiveTab('active')}
              className={cn(
                'cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold',
                activeTab === 'active' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'
              )}
            >
              Active
            </button>
            <button
              onClick={() => setActiveTab('expired')}
              className={cn(
                'cursor-pointer rounded-lg px-4 py-2.5 text-sm font-semibold',
                activeTab === 'expired' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-700'
              )}
            >
              Expired
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-4">Plan</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2 text-center">Usage</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-2 text-right">Action</div>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading packages...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No {activeTab} plans found</div>
          ) : (
            filtered.map((plan) => {
              const isExpired = plan.PlanStatus === 'Expired';
              const used = plan.TotalProducts - plan.RemainingProducts;
              const selectable = isSelectMode && !isExpired && plan.RemainingProducts > 0;
              return (
                <div
                  key={plan.PlanReqID}
                  className={cn(
                    'grid grid-cols-12 items-center border-b border-gray-100 px-4 py-3 text-sm hover:bg-gray-50',
                    selectable && 'cursor-pointer'
                  )}
                  onClick={() => {
                    if (selectable) {
                      router.push(
                        `/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`
                      );
                    }
                  }}
                >
                  <div className="col-span-4">
                    <p className="font-semibold text-gray-800">{plan.PlanTitle}</p>
                    <p className="text-xs text-gray-500 line-clamp-1">{plan.PlanDescription}</p>
                  </div>
                  <div className="col-span-2">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
                        isExpired ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      )}
                    >
                      {isExpired ? <FiClock className="w-3.5 h-3.5" /> : <FiCheckCircle className="w-3.5 h-3.5" />}
                      {plan.PlanStatus}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-gray-700">
                    {used}/{plan.TotalProducts}
                  </div>
                  <div className="col-span-2 text-right font-bold text-[#003049]">Rs {formatPrice(plan.Price)}</div>
                  <div className="col-span-2 text-right">
                    {!isSelectMode ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(
                            `/my-ads?planReqId=${plan.PlanReqID}&planTitle=${encodeURIComponent(plan.PlanTitle)}`
                          );
                        }}
                        disabled={isExpired || plan.RemainingProducts === 0}
                        className={cn(
                          'cursor-pointer inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold',
                          isExpired || plan.RemainingProducts === 0
                            ? 'cursor-not-allowed bg-gray-200 text-gray-500'
                            : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        )}
                      >
                        <FiStar className="w-3.5 h-3.5" />
                        Use Plan
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">{selectable ? 'Tap row to select' : 'Unavailable'}</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Container>
    </main>
  );
}
