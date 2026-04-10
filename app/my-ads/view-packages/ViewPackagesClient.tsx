// src/app/view-packages/page.tsx (or client component)
'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiCheckCircle, FiRefreshCw, FiTag, FiPackage, FiZap, FiTrendingUp } from 'react-icons/fi';
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

  const getPackageIcon = (type: string) => {
    const lowerType = type?.toLowerCase() || '';
    if (lowerType.includes('premium') || lowerType.includes('featured')) return FiZap;
    if (lowerType.includes('boost') || lowerType.includes('urgent')) return FiTrendingUp;
    return FiPackage;
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-28">
      <Container className="space-y-6">
        {/* Header Section */}
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-lg">
          <div className="bg-primary p-6 text-white sm:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold sm:text-4xl">Packages & Bundles</h1>
                <p className="mt-2 text-primary-light/90">
                  Select a package to improve listing visibility and sell faster
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.push('/my-ads')}
                  className="rounded-xl cursor-pointer border-2 border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold backdrop-blur-sm transition hover:bg-white/20"
                >
                  Back to My Ads
                </button>
                <button
                  onClick={async () => {
                    setRefreshing(true);
                    await refreshPlans();
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

          {/* Promo Code Section */}
          <div className="border- border-gray-200 p-4 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FiTag className="h-5 w-5 text-accent" />
                  <p className="text-lg font-bold text-gray-900">Promo Code</p>
                </div>
                <p className="mt-1 text-sm text-gray-600">
                  {hasPromoApplied
                    ? '🎉 Promo is active on your account'
                    : 'Apply a promo code for additional discount'}
                </p>
              </div>
              <button
                onClick={() => setShowPromoModal(true)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-bold shadow-lg transition-all hover:shadow-xl active:scale-95',
                  hasPromoApplied
                    ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                    : 'bg-gradient-to-r from-accent to-accent-dark text-white'
                )}
              >
                {hasPromoApplied ? (
                  <>
                    <FiCheckCircle className="h-4 w-4" />
                    <span>Applied</span>
                  </>
                ) : (
                  <>
                    <FiTag className="h-4 w-4" />
                    <span>Apply Promo</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-3xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-16 text-center shadow-lg">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
              <FiPackage className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">No packages available</h3>
            <p className="mt-2 text-gray-600">Please check back later</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((plan, index) => {
              const Icon = getPackageIcon(plan.type);
              const hasDiscount =
                plan.pricing.strikePrice && plan.pricing.strikePrice > plan.pricing.finalPrice;
              const discountPercent = hasDiscount
                ? Math.round(
                    ((plan.pricing.strikePrice - plan.pricing.finalPrice) /
                      plan.pricing.strikePrice) *
                      100
                  )
                : 0;

              return (
                <div
                  key={plan.adPlanId}
                  className={cn(
                    'group relative overflow-hidden rounded-3xl border-2 bg-white shadow-lg transition-all hover:shadow-2xl',
                    index === -1
                      ? 'border-accent ring-4 ring-accent/20'
                      : 'border-gray-200 hover:border-primary'
                  )}
                >
                  {/* Popular Badge */}
                  {index === -1 && (
                    <div className="absolute right-4 top-4 z-10 rounded-full bg-gradient-to-r from-accent to-accent-dark px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                      🔥 MOST POPULAR
                    </div>
                  )}

                  {/* Discount Badge */}
                  {hasDiscount && (
                    <div className="absolute left-4 top-4 z-10 rounded-full bg-gradient-to-r from-green-500 to-green-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      {discountPercent}% OFF
                    </div>
                  )}

                  {/* Card Content */}
                  <div className="p-6 sm:p-8">
                    {/* Icon */}
                    <div className="mb-6 flex items-center justify-between">
                      <div
                        className={cn(
                          'flex h-14 w-14 items-center justify-center rounded-2xl',
                          index === -1
                            ? 'bg-accent text-white'
                            : 'bg-primary/10 text-primary'
                        )}
                      >
                        <Icon className="h-7 w-7" />
                      </div>
                      <span
                        className={cn(
                          'rounded-full px-3 py-1 text-xs font-semibold',
                          index === -1
                            ? 'bg-accent/10 text-accent'
                            : 'bg-gray-100 text-gray-700'
                        )}
                      >
                        {plan.type}
                      </span>
                    </div>

                    {/* Plan Name */}
                    <h3 className="mb-2 text-2xl font-bold text-gray-900">{plan.adPlanName}</h3>

                    {/* Description */}
                    <p className="mb-6 line-clamp-2 min-h-[2.5rem] text-sm text-gray-600">
                      {plan.description || 'Boost your listing visibility'}
                    </p>

                    {/* Pricing */}
                    <div className="mb-6 ">
                      {hasDiscount && (
                        <div className="mb-1 flex items-center gap-2">
                          <span className="text-lg text-gray-400 line-through">
                            Rs {formatPrice(plan.pricing.strikePrice)}
                          </span>
                        </div>
                      )}
                      <div className="flex items-end gap-2">
                        <span className="text-4xl font-bold text-primary">
                          Rs {formatPrice(plan.pricing.finalPrice)}
                        </span>
                      </div>
                    </div>

                    {/* Features (if available) */}
                    {/* {plan.adPlanName && (
                      <div className="mb-6 space-y-2">
                        {[
                          'Featured listing',
                          'Priority in search',
                          'Extended visibility',
                        ].map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                            <FiCheckCircle className="h-4 w-4 shrink-0 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    )} */}

                    {/* Buy Button */}
                    <button
                      onClick={() =>
                        router.push(
                          `/payment/select-method?planId=${plan.adPlanId}&price=${plan.pricing.finalPrice}`
                        )
                      }
                      className={cn(
                        'flex w-full items-center cursor-pointer justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-lg transition-all hover:shadow-xl active:scale-95',
                        index === -1
                          ? 'bg-accent text-white'
                          : 'bg-primary text-white'
                      )}
                    >
                      <span>Buy Now</span>
                      <svg
                        className="h-5 w-5 transition-transform group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Hover Effect Border */}
                  {/* <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-primary/0 via-accent/0 to-primary/0 opacity-0 transition-opacity group-hover:opacity-10" /> */}
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        {/* <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: FiZap,
              title: 'Instant Activation',
              description: 'Your package activates immediately after payment',
              color: 'text-yellow-600',
              bg: 'bg-yellow-100',
            },
            {
              icon: FiTrendingUp,
              title: 'Increased Visibility',
              description: 'Get more views and reach potential buyers faster',
              color: 'text-blue-600',
              bg: 'bg-blue-100',
            },
            {
              icon: FiCheckCircle,
              title: 'Secure Payment',
              description: 'Multiple payment options with SSL encryption',
              color: 'text-green-600',
              bg: 'bg-green-100',
            },
          ].map((feature, index) => (
            <div
              key={index}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-lg"
            >
              <div className={cn('mb-4 inline-flex rounded-xl p-3', feature.bg)}>
                <feature.icon className={cn('h-6 w-6', feature.color)} />
              </div>
              <h3 className="mb-2 font-bold text-gray-900">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div> */}

        {/* Help Section */}
        {/* <div className="rounded-3xl border border-gray-200 bg-gradient-to-br from-primary/5 to-accent/5 p-6 sm:p-8">
          <div className="text-center">
            <h3 className="mb-2 text-xl font-bold text-gray-900">Need Help Choosing?</h3>
            <p className="mx-auto mb-6 max-w-2xl text-gray-600">
              Not sure which package is right for you? Our support team is here to help you make the
              best decision for your listing.
            </p>
            <button
              onClick={() => router.push('/contact')}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
            >
              <span>Contact Support</span>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </div>
        </div> */}
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