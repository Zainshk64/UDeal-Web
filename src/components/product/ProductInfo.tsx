'use client';

import React from 'react';
import { FiMapPin, FiClock, FiTag } from 'react-icons/fi';
import { ProductDetail } from '@/src/api/services/HomeApi';
import { cn } from '@/src/utils/cn';

interface ProductInfoProps {
  detail: ProductDetail;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ detail }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Price & Condition */}
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-3xl sm:text-4xl font-black text-[#F97316]">
          PKR {detail.Price?.toLocaleString()}
        </h2>

        {detail.ConditionName && (
          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
            {detail.ConditionName}
          </span>
        )}

        {detail.MarkAsSold && (
          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
            SOLD
          </span>
        )}
      </div>

      {/* Title */}
      <h1 className="text-xl sm:text-2xl font-bold text-[#003049]">
        {detail.ProdcutTitle}
      </h1>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-2">
        {detail.CityName && (
          <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
            <FiMapPin className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-gray-600 text-sm font-medium">
              {detail.CityName}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
          <FiClock className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-gray-600 text-sm font-medium">
            {formatDate(detail.CreatedDateTime)}
          </span>
        </div>

        {detail.CategoryName && (
          <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
            <FiTag className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-blue-600 text-sm font-medium">
              {detail.CategoryName}
            </span>
          </div>
        )}
      </div>

      {/* Address */}
      {detail.Address && (
        <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-xl border border-blue-100">
          <FiMapPin className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700 text-sm">{detail.Address}</p>
        </div>
      )}
    </div>
  );
};