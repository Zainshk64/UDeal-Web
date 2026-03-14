'use client';

import React from 'react';

export const ProductDetailSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full h-[400px] bg-gray-200 rounded-b-2xl" />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-10 bg-gray-200 rounded w-48" />
            <div className="h-8 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />

            <div className="space-y-3 mt-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-5 bg-gray-200 rounded w-48" />
                </div>
              ))}
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            <div className="bg-gray-100 rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-gray-200 rounded-full" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-4 bg-gray-200 rounded w-24" />
                </div>
              </div>
              <div className="h-12 bg-gray-200 rounded-xl" />
              <div className="h-12 bg-gray-200 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};