'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { Step1Category } from '@/src/components/addpost/Step1Category';
import { Step2Subcategory } from '@/src/components/addpost/Step2Subcategory';
import { Step3AdDetails } from '@/src/components/addpost/Step3AdDetails';
import { ROUTES, CATEGORIES } from '@/src/utils/constants';
import AppAdBanner from '@/src/components/ads/AppAdBanner';
import GoogleAdSlot from '@/src/components/ads/GoogleAdSlot';
import { usePageAds } from '@/src/hooks/usePageAds';

type AddPostStep = 1 | 2 | 3;

export default function AddPostPage() {
  const { ads } = usePageAds('All Listings Page');
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState<AddPostStep>(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);
  const [selectedSubcategoryName, setSelectedSubcategoryName] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  const categoryName =
    selectedCategory != null
      ? CATEGORIES.find((c) => c.id === selectedCategory)?.name ?? 'Category'
      : '';

  const handleNextStep = () => {
    if (currentStep === 1 && selectedCategory) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedSubcategory) {
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as AddPostStep);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return 'Select category';
      case 2:
        return 'Select subcategory';
      case 3:
        return 'Ad details';
      default:
        return 'Add Post';
    }
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !selectedCategory;
    if (currentStep === 2) return !selectedSubcategory;
    return false;
  };

  if (authLoading) {
    return <div className="min-h-screen bg-white" />;
  }

  return (
    <>
      <div className="min-h-screen bg-white">
        {/* Header */}
        <section className="gradient-primary text-white pt-44 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Post a New Ad</h1>
            <p className="text-white/90">
              Step {currentStep} of 3 — {getStepTitle()}
            </p>
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 mt-4 sm:px-6 lg:px-8">
          <AppAdBanner ad={ads.top} className="mb-4" />
        </div>

        {/* Progress Bar */}
        <section className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {[1, 2, 3].map((step) => (
                <React.Fragment key={step}>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-colors ${
                      currentStep >= step
                        ? 'bg-[#F97316] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </motion.div>
                  {step < 3 && (
                    <div
                      className={`h-1 flex-1 transition-colors ${
                        currentStep > step ? 'bg-[#F97316]' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step1Category
                      selectedCategory={selectedCategory}
                      onSelect={setSelectedCategory}
                    />
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step2Subcategory
                      categoryId={selectedCategory || 0}
                      selectedSubcategory={selectedSubcategory}
                      onSelect={(id, name) => {
                        setSelectedSubcategory(id);
                        setSelectedSubcategoryName(name);
                        // Auto-advance to step 3 after 500ms
                        setTimeout(() => setCurrentStep(3), 500);
                      }}
                    />
                  </motion.div>
                )}

                {currentStep === 3 && selectedCategory && selectedSubcategory && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Step3AdDetails
                      categoryId={selectedCategory}
                      subCatId={selectedSubcategory}
                      categoryName={categoryName}
                      subcategoryName={selectedSubcategoryName}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <aside className="hidden lg:block lg:col-span-3">
              <div className="sticky top-28 space-y-4">
                <GoogleAdSlot
                  slot="sidebar"
                  className=""
                  format="rectangle"
                  responsive={false}
                />
                <AppAdBanner ad={ads.center} />
              </div>
            </aside>
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className="border-t border-gray-200 px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-4xl justify-between gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-6 py-2.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiChevronLeft className="h-5 w-5" />
              Previous
            </motion.button>

            {currentStep < 3 ? (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleNextStep}
                disabled={isNextDisabled()}
                className="gradient-primary flex cursor-pointer items-center gap-2 rounded-lg px-6 py-2.5 font-medium text-white shadow-md transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <FiChevronRight className="h-5 w-5" />
              </motion.button>
            ) : (
              <span className="text-sm text-slate-500">
                Use the{' '}
                <span className="font-semibold text-slate-700">Post ad</span> button at the bottom of the form.
              </span>
            )}
          </div>
        </section>
        <div className="mx-auto max-w-6xl px-4 pb-8 sm:px-6 lg:px-8">
          <AppAdBanner ad={ads.bottom} />
        </div>
      </div>
    </>
  );
}
