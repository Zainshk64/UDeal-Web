'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiRefreshCw,
  FiTag,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiStar,
} from 'react-icons/fi';
import { toast } from 'sonner';

import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '@/src/components/ui/Container';
import { PromoCodeModal } from '@/src/components/packages/PromoCodeModal';
import { useAuth } from '@/src/context/AuthContext';
import {
  getAllPackages,
  addPromoCode,
  BundlePlan,
  formatPrice,
  calculatePricing,
} from '@/src/api/services/PackagesApi';
import { getUserData, updateUserData } from '@/src/utils/storage';
import { cn } from '@/src/utils/cn';

export default function ViewPackagesPage() {
  const router = useRouter();
  const { user } = useAuth();

  const [plans, setPlans] = useState<BundlePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDays, setSelectedDays] = useState<number | null>(null);
  const [hasPromoApplied, setHasPromoApplied] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoValidating, setPromoValidating] = useState(false);

  useEffect(() => {
    const init = async () => {
      const userData = getUserData();
      if (userData?.promocode) setHasPromoApplied(true);
      const data = await getAllPackages();
      setPlans(data);
      setLoading(false);
    };
    init();
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    const data = await getAllPackages();
    setPlans(data);
    setRefreshing(false);
  }, []);

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
      toast.success('Promo Code Applied! 🎉', { description: response.message });
      handleRefresh();
    } else {
      toast.error('Invalid Code', { description: response.message });
    }
  };

  const bundles = useMemo(() => plans.filter((p) => p.type.toLowerCase().includes('bundle')), [plans]);
  const featuredPlans = useMemo(() => plans.filter((p) => p.type.toLowerCase().includes('featured') || p.type.toLowerCase().includes('plan')), [plans]);
  const daysOptions = useMemo(() => {
    const days = new Set<number | null>([null]);
    featuredPlans.forEach((p) => { if (p.duration_Days > 0) days.add(p.duration_Days); });
    return Array.from(days).sort((a, b) => (a || 0) - (b || 0));
  }, [featuredPlans]);
  const filteredFeatured = useMemo(() => selectedDays === null ? featuredPlans : featuredPlans.filter((p) => p.duration_Days === selectedDays), [featuredPlans, selectedDays]);

  const renderCard = (plan: BundlePlan, type: 'bundle' | 'featured') => {
    const pricing = calculatePricing(plan.price, plan.discount, hasPromoApplied);

    return (
      <motion.div
        key={plan.adPlanId}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
      >
        {/* Discount Banner */}
        {plan.discount > 0 && (
          <div className={cn('py-2 px-4 flex items-center justify-center gap-2 text-white text-xs font-bold', hasPromoApplied ? 'bg-green-500' : 'bg-[#F97316]')}>
            {hasPromoApplied ? (
              <><FiCheckCircle className="w-3.5 h-3.5" /> PROMO APPLIED · You saved PKR {formatPrice(plan.discount)}</>
            ) : (
              <><FiTag className="w-3.5 h-3.5" /> Apply promo to save PKR {formatPrice(plan.discount)}</>
            )}
          </div>
        )}

        <div className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            {/* Left */}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-[#003049]">{plan.adPlanName}</h3>
              <p className="text-sm text-gray-600 mt-1">{plan.description}</p>

              <div className="flex items-center gap-1 mt-2 text-gray-500">
                {type === 'bundle' ? <FiClock className="w-3.5 h-3.5" /> : <FiCalendar className="w-3.5 h-3.5" />}
                <span className="text-xs">{type === 'bundle' ? plan.type : `${plan.duration_Days} Days`}</span>
              </div>

              {!hasPromoApplied && pricing.hasDiscount && (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="flex items-center gap-1 mt-3 text-blue-800 text-xs font-semibold underline"
                >
                  <FiTag className="w-3.5 h-3.5" />
                  Apply Promo to get PKR {formatPrice(plan.discount)} off
                </button>
              )}
            </div>

            {/* Right */}
            <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
              <div className="text-right">
                <p className="text-xl font-bold text-[#F97316]">PKR {formatPrice(pricing.finalPrice)}</p>
                {pricing.hasDiscount && pricing.strikePrice && (
                  <p className={cn('text-xs line-through', hasPromoApplied ? 'text-gray-400' : 'text-red-500')}>
                    PKR {formatPrice(pricing.strikePrice)}
                  </p>
                )}
                {pricing.savings > 0 && (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                    SAVED PKR {formatPrice(pricing.savings)}
                  </span>
                )}
              </div>
              <button className="px-5 py-2.5 bg-[#F97316] text-white rounded-xl font-bold text-sm hover:bg-[#ea580c] transition-colors mt-2">
                {type === 'bundle' ? 'Get Bundle' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

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
                <h1 className="text-2xl font-bold text-white">Packages & Bundles</h1>
              </div>
              <button onClick={handleRefresh} disabled={refreshing} className="p-2.5 bg-white/10 rounded-xl text-white disabled:opacity-50">
                <FiRefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </Container>
        </div>

        <Container className="py-6 space-y-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-32" />
                    <div className="h-10 bg-gray-200 rounded-xl w-28" />
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-28 h-28 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <span className="text-5xl">📦</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-700">No Packages Available</h3>
              <p className="text-gray-500 mt-3">Check back later for new packages!</p>
              <button onClick={handleRefresh} className="mt-6 bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold inline-flex items-center gap-2">
                <FiRefreshCw className="w-5 h-5" /> Refresh
              </button>
            </div>
          ) : (
            <>
              {/* Promo Banner */}
              {!hasPromoApplied ? (
                <button
                  onClick={() => setShowPromoModal(true)}
                  className="w-full bg-[#F97316] rounded-2xl p-4 flex items-center gap-4 text-left hover:bg-[#ea580c] transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    <FiTag className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-white text-lg font-bold">Have a Promo Code?</p>
                    <p className="text-white/80 text-sm">Apply now to unlock exclusive discounts!</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                    →
                  </div>
                </button>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <FiCheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-bold">Promo Code Applied!</p>
                    <p className="text-green-600 text-sm">Discounts are now active on all packages</p>
                  </div>
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold">ACTIVE</span>
                </div>
              )}

              {/* Bundles Section */}
              {bundles.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Bundles</h2>
                  <div className="space-y-4">
                    {bundles.map((b) => renderCard(b, 'bundle'))}
                  </div>
                </section>
              )}

              {/* Featured Plans Section */}
              {featuredPlans.length > 0 && (
                <section>
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">Featured Plans</h2>

                  {/* Day Filter Tabs */}
                  <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide mb-4">
                    {daysOptions.map((days) => (
                      <button
                        key={days ?? 'all'}
                        onClick={() => setSelectedDays(days)}
                        className={cn(
                          'px-5 py-2 rounded-full font-semibold text-sm whitespace-nowrap transition-all',
                          selectedDays === days
                            ? 'bg-[#F97316] text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        )}
                      >
                        {days === null ? 'All' : `${days} Days`}
                      </button>
                    ))}
                  </div>

                  {filteredFeatured.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <FiStar className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No plans for this filter</p>
                      <button onClick={() => setSelectedDays(null)} className="mt-3 text-[#F97316] font-semibold text-sm">
                        Show All Plans
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredFeatured.map((p) => renderCard(p, 'featured'))}
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </Container>
      </main>

      <Footer />

      <PromoCodeModal
        open={showPromoModal}
        onClose={() => setShowPromoModal(false)}
        onApply={handleApplyPromo}
        isLoading={promoValidating}
      />
    </>
  );
}