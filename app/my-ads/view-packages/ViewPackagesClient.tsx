'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiRefreshCw, FiTag } from 'react-icons/fi';
import { toast } from 'sonner';
import { Container } from '@/src/components/ui/Container';
import { PromoCodeModal } from '@/src/components/packages/PromoCodeModal';
import { useAuth } from '@/src/context/AuthContext';
import {
  BundlePlan,
  addPromoCode,
  calculatePricing,
  formatPrice,
  getAllPackages,
} from '@/src/api/services/PackagesApi';
import { getUserData, updateUserData } from '@/src/utils/storage';
import { cn } from '@/src/utils/cn';

export default function ViewPackagesClient() {
  const router = useRouter();
  const { user } = useAuth();
  const [plans, setPlans] = useState<BundlePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoValidating, setPromoValidating] = useState(false);
  const [hasPromoApplied, setHasPromoApplied] = useState(false);

  const refreshPlans = useCallback(async () => {
    const data = await getAllPackages();
    setPlans(data);
  }, []);

  useEffect(() => {
    const init = async () => {
      const userData = getUserData();
      if (userData?.promocode) setHasPromoApplied(true);
      await refreshPlans();
      setLoading(false);
    };
    init();
  }, [refreshPlans]);

  const handleApplyPromo = async (code: string) => {
    if (!user?.userId) {
      toast.error('Login Required', { description: 'Please login to apply promo code' });
      setShowPromoModal(false);
      return;
    }
    setPromoValidating(true);
    const response = await addPromoCode(code, user.userId);
    setPromoValidating(false);
    if (response.result) {
      updateUserData({ promocode: code });
      setHasPromoApplied(true);
      setShowPromoModal(false);
      toast.success('Promo Code Applied', { description: response.message });
      await refreshPlans();
    } else {
      toast.error('Invalid Code', { description: response.message });
    }
  };

  const rows = useMemo(
    () =>
      plans.map((p) => {
        const pricing = calculatePricing(p.price, p.discount, hasPromoApplied);
        return { ...p, pricing };
      }),
    [plans, hasPromoApplied]
  );

  return (
    <main className="py-28 min-h-screen bg-gray-100">
      <Container className="space-y-5">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Packages & Bundles</h1>
              <p className="text-sm text-gray-500">
                Select a package to improve listing visibility and sell faster
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
                  await refreshPlans();
                  setRefreshing(false);
                }}
                className="cursor-pointer rounded-lg border border-gray-200 p-2.5 hover:bg-gray-50"
              >
                <FiRefreshCw className={cn('w-5 h-5', refreshing && 'animate-spin')} />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-800">Promo Code</p>
            <p className="text-sm text-gray-500">
              {hasPromoApplied ? 'Promo is active on current account' : 'Apply a promo code for discount'}
            </p>
          </div>
          <button
            onClick={() => setShowPromoModal(true)}
            className={cn(
              'cursor-pointer rounded-lg px-4 py-2 text-sm font-semibold',
              hasPromoApplied ? 'bg-green-100 text-green-700' : 'bg-[#F97316] text-white hover:bg-[#ea580c]'
            )}
          >
            {hasPromoApplied ? (
              <span className="inline-flex items-center gap-1">
                <FiCheckCircle className="w-4 h-4" /> Applied
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <FiTag className="w-4 h-4" /> Apply Promo
              </span>
            )}
          </button>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="grid grid-cols-12 border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <div className="col-span-4">Plan Name</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-2 text-right">Original</div>
            <div className="col-span-2 text-right">Final Price</div>
            <div className="col-span-2 text-right">Action</div>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading packages...</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No packages available</div>
          ) : (
            rows.map((plan) => (
              <div key={plan.adPlanId} className="grid grid-cols-12 items-center border-b border-gray-100 px-4 py-3 text-sm hover:bg-gray-50">
                <div className="col-span-4">
                  <p className="font-semibold text-gray-800">{plan.adPlanName}</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{plan.description}</p>
                </div>
                <div className="col-span-2 text-gray-700">{plan.type}</div>
                <div className="col-span-2 text-right text-gray-500 line-through">
                  Rs {formatPrice(plan.pricing.strikePrice || plan.price)}
                </div>
                <div className="col-span-2 text-right font-bold text-[#003049]">
                  Rs {formatPrice(plan.pricing.finalPrice)}
                </div>
                <div className="col-span-2 text-right">
                  <button
                    onClick={() => router.push('/payment/select-method?planId=' + plan.adPlanId)}
                    className="cursor-pointer rounded-lg bg-[#F97316] px-3 py-2 text-xs font-semibold text-white hover:bg-[#ea580c]"
                  >
                    Buy 
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </Container>
      <PromoCodeModal
        open={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onApply={handleApplyPromo}
        isLoading={promoValidating}
      />
    </main>
  );
}
