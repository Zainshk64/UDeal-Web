'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronRight, FiChevronLeft } from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { Navbar } from '@/src/components/layout/Navbar';
import { Step1Category } from '@/src/components/addpost/Step1Category';
import { Step2Subcategory } from '@/src/components/addpost/Step2Subcategory';
import { ROUTES } from '@/src/utils/constants';

type AddPostStep = 1 | 2;

export default function AddPostPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<AddPostStep>(1);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<number | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(ROUTES.LOGIN);
    }
  }, [isAuthenticated, authLoading, router]);

  const handleNextStep = () => {
    if (currentStep === 1 && selectedCategory) {
      setCurrentStep(2);
    } else if (currentStep === 2 && selectedSubcategory) {
      // TODO: Navigate to next steps or complete form
      console.log('Add post with category:', selectedCategory, 'subcategory:', selectedSubcategory);
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
        return 'Select Category';
      case 2:
        return 'Select Subcategory';
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
        <section className="gradient-primary text-white pt-44 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl font-bold mb-2">Post a New Ad</h1>
            <p className="text-white/90">
              Step {currentStep} of 2 - {getStepTitle()}
            </p>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
              {[1, 2].map((step) => (
                <React.Fragment key={step}>
                  <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                      currentStep >= step
                        ? 'bg-[#F97316] text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </motion.div>
                  {step < 2 && (
                    <div
                      className={`flex-1 h-1 transition-colors ${
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
          <div className="max-w-4xl mx-auto">
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
                    onSelect={setSelectedSubcategory}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* Navigation Buttons */}
        <section className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
          <div className="max-w-4xl mx-auto flex gap-4 justify-between">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePrevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 cursor-pointer px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiChevronLeft className="w-5 h-5" />
              Previous
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNextStep}
              disabled={isNextDisabled()}
              className="flex items-center gap-2 px-6 py-2.5 cursor-pointer gradient-primary text-white rounded-lg font-medium hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentStep === 2 ? 'Complete' : 'Next'}
              <FiChevronRight className="w-5 h-5" />
            </motion.button>
          </div>
        </section>
      </div>
    </>
  );
}
