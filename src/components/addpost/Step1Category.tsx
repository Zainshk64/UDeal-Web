'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/src/utils/constants';

interface Step1CategoryProps {
  selectedCategory: number | null;
  onSelect: (categoryId: number) => void;
}

export const Step1Category: React.FC<Step1CategoryProps> = ({
  selectedCategory,
  onSelect,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Category</h2>
        <p className="text-gray-600">Choose the category that best fits your product</p>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((category, index) => (
          <motion.button
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelect(category.id)}
            className={`cursor-pointer rounded-xl border-2 p-5 text-center transition-all sm:p-6 ${
              selectedCategory === category.id
                ? 'border-[#F97316] bg-orange-50 shadow-lg'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative mx-auto mb-3 flex h-16 w-16 items-center justify-center sm:h-20 sm:w-20">
              {'image' in category && category.image ? (
                <Image
                  src={category.image}
                  alt=""
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-4xl">{'icon' in category ? category.icon : ''}</span>
              )}
            </div>
            <h3 className="text-base font-semibold text-gray-900">{category.name}</h3>
            {selectedCategory === category.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="mt-3 inline-flex items-center justify-center w-6 h-6 bg-[#F97316] text-white rounded-full text-sm font-bold"
              >
                ✓
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      {/* Info */}
      {selectedCategory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-blue-900 text-sm">
            <strong>Selected:</strong> {CATEGORIES.find((c) => c.id === selectedCategory)?.name}
          </p>
          <p className="text-blue-800 text-xs mt-1">
            Click Next to continue with subcategory selection
          </p>
        </motion.div>
      )}
    </div>
  );
};
