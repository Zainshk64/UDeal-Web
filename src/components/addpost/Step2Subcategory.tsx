'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSubcategories } from '@/src/api/services/HomeApi';
import { CATEGORIES } from '@/src/utils/constants';

interface Subcategory {
  SubCategoryId: number;
  SubCategoryName: string;
}

interface Step2SubcategoryProps {
  categoryId: number;
  selectedSubcategory: number | null;
  onSelect: (subcategoryId: number) => void;
}

export const Step2Subcategory: React.FC<Step2SubcategoryProps> = ({
  categoryId,
  selectedSubcategory,
  onSelect,
}) => {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const category = CATEGORIES.find((c) => c.id === categoryId);

  useEffect(() => {
    const loadSubcategories = async () => {
      setIsLoading(true);
      setError('');
      try {
        const data = await getSubcategories(categoryId);
        setSubcategories(data);
      } catch (err) {
        setError('Failed to load subcategories');
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      loadSubcategories();
    }
  }, [categoryId]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Subcategory</h2>
        <p className="text-gray-600">
          Choose a subcategory for{' '}
          <span className="font-semibold text-[#003049]">
            {category?.name}
          </span>
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-900 text-sm">{error}</p>
        </motion.div>
      )}

      {/* Subcategories Grid */}
      {!isLoading && subcategories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {subcategories.map((subcategory, index) => (
            <motion.button
              key={subcategory.SubCategoryId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onSelect(subcategory.SubCategoryId)}
              className={`p-6 rounded-lg border-2 transition-all text-center cursor-pointer ${
                selectedSubcategory === subcategory.SubCategoryId
                  ? 'border-[#F97316] bg-orange-50 shadow-lg'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-md'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h3 className="font-semibold text-gray-900 text-base">
                {subcategory.SubCategoryName}
              </h3>
              {selectedSubcategory === subcategory.SubCategoryId && (
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
      )}

      {/* Empty State */}
      {!isLoading && subcategories.length === 0 && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-600">No subcategories available for this category</p>
        </motion.div>
      )}

      {/* Selection Info */}
      {selectedSubcategory && !isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-blue-900 text-sm">
            <strong>Selected:</strong>{' '}
            {subcategories.find((s) => s.SubCategoryId === selectedSubcategory)
              ?.SubCategoryName}
          </p>
          <p className="text-blue-800 text-xs mt-1">
            Click Next to continue with product details
          </p>
        </motion.div>
      )}
    </div>
  );
};
