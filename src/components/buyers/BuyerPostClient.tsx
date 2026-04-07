'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiChevronRight } from 'react-icons/fi';
import { toast } from 'sonner';

import { Container } from '@/src/components/ui/Container';
import { CATEGORIES, ROUTES } from '@/src/utils/constants';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/utils/cn';
import {
  getBuyerSubcategories,
  type BuyerSubcategory,
  submitBuyerRequest,
  getBuyerRequestById,
  mapBuyerRequestToFormValues,
} from '@/src/api/services/buyerPostApi';
import {
  resolveBuyerFormFields,
  type FormField,
} from '@/src/components/buyers/buyerFormConfig';
import { BuyerRequestFormStep } from '@/src/components/buyers/BuyerRequestFormStep';

type Step = 1 | 2 | 3;

function digitsFromStoredMob(mob?: string): string {
  if (!mob) return '';
  const d = mob.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('92')) return d.slice(-10);
  if (d.length >= 11 && d.startsWith('0')) return d.slice(1, 11);
  if (d.length === 10 && d.startsWith('3')) return d;
  if (d.length > 10) return d.slice(-10);
  return d.length === 10 ? d : '';
}

export default function BuyerPostClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editIdRaw = searchParams.get('edit');
  const editId = editIdRaw ? Number(editIdRaw) : 0;

  const { isAuthenticated, isLoading: authLoading, user, refreshAuth } = useAuth();

  const [step, setStep] = useState<Step>(1);
  const [loadingEdit, setLoadingEdit] = useState(!!editId);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subCatId, setSubCatId] = useState<number | null>(null);
  const [subs, setSubs] = useState<BuyerSubcategory[]>([]);
  const [subsLoading, setSubsLoading] = useState(false);
  const [productReqId, setProductReqId] = useState(0);
  const [initialForm, setInitialForm] = useState<Record<string, unknown>>({});

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!editId) {
      setLoadingEdit(false);
      return;
    }
    (async () => {
      setLoadingEdit(true);
      const req = await getBuyerRequestById(editId);
      if (!req) {
        toast.error('Request not found');
        router.replace(ROUTES.BUYERS_MY_REQUESTS);
        return;
      }
      const raw = req as Record<string, unknown>;
      const cat = Number(req.categoryId ?? raw.CategoryId ?? raw.CatId ?? 0);
      const sub = Number(req.subCatId ?? raw.SubCatId ?? 0);
      if (cat && sub) {
        setCategoryId(cat);
        setSubCatId(sub);
        setProductReqId(req.productReqId);
        setInitialForm(mapBuyerRequestToFormValues(req));
        setStep(3);
      } else {
        toast.error('Could not load category for this request');
      }
      setLoadingEdit(false);
    })();
  }, [editId, router]);

  useEffect(() => {
    if (!categoryId || step < 2) return;
    setSubsLoading(true);
    (async () => {
      const list = await getBuyerSubcategories(categoryId);
      setSubs(list);
      setSubsLoading(false);
    })();
  }, [categoryId, step]);

  const categoryName = useMemo(
    () => CATEGORIES.find((c) => c.id === categoryId)?.name ?? '',
    [categoryId]
  );

  const goNextFromCat = () => {
    if (!categoryId) {
      toast.error('Select a category');
      return;
    }
    setStep(2);
    setSubCatId(null);
  };

  const goNextFromSub = () => {
    if (!subCatId) {
      toast.error('Select a subcategory');
      return;
    }
    setStep(3);
  };

  if (authLoading || loadingEdit) {
    return (
      <div className="min-h-screen bg-gray-50 py-24">
        <Container>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-10 ">
      <section className="border-b border-gray-200 pt-35 pb-10 bg-gradient-to-r from-[#003049] to-[#004d6d] py-10 text-white">
        <Container>
          <Link href={ROUTES.BUYERS} className="text-sm cursor-pointer text-white/80 hover:text-white">
            ← Back to buyers
          </Link>
          <h1 className="mt-4 text-2xl font-bold md:text-3xl">
            {editId ? 'Edit buyer request' : 'Post buyer request'}
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Step {step} of 3 —{' '}
            {step === 1 ? 'Category' : step === 2 ? 'Subcategory' : 'Details'}
          </p>
          <div className="mt-4 flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'h-1 flex-1 rounded-full',
                  step >= s ? 'bg-[#F97316]' : 'bg-white/20'
                )}
              />
            ))}
          </div>
        </Container>
      </section>

      <Container className="mt-8">
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Choose category</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition',
                    categoryId === c.id
                      ? 'border-[#F97316] bg-orange-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  )}
                >
                  <div className="relative h-12 w-12 shrink-0">
                    {'image' in c && c.image ? (
                      <Image src={c.image} alt="" width={48} height={48} className="object-contain" />
                    ) : (
                      <span className="text-2xl">{'icon' in c ? c.icon : ''}</span>
                    )}
                  </div>
                  <span className="font-medium text-gray-900">{c.name}</span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={goNextFromCat}
              className="mt-8 flex items-center gap-2 rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-white"
            >
              Next <FiChevronRight />
            </button>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Subcategory</h2>
            <p className="mb-4 text-sm text-gray-600">{categoryName}</p>
            {subsLoading ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {subs.map((s) => (
                  <button
                    key={s.subCatId}
                    type="button"
                    onClick={() => setSubCatId(s.subCatId)}
                    className={cn(
                      'rounded-xl border-2 p-4 text-left font-medium transition',
                      subCatId === s.subCatId
                        ? 'border-[#F97316] bg-orange-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    )}
                  >
                    {s.subcategoryName}
                  </button>
                ))}
              </div>
            )}
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-gray-300 px-5 py-2.5 font-medium"
              >
                Back
              </button>
              <button
                type="button"
                onClick={goNextFromSub}
                className="rounded-xl bg-[#F97316] px-6 py-2.5 font-semibold text-white"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && categoryId && subCatId && user?.userId && (
          <BuyerRequestFormStep
            categoryId={categoryId}
            subCatId={subCatId}
            userId={user.userId}
            productReqId={productReqId}
            initialValues={initialForm}
            profilePhoneDigits={digitsFromStoredMob(user.mobNumber)}
            onSuccess={() => router.push(ROUTES.BUYERS_MY_REQUESTS)}
            onBack={() => setStep(2)}
          />
        )}
      </Container>
    </div>
  );
}
