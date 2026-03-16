'use client';

import React from 'react';

export const MyAdsSkeleton: React.FC = () => {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="flex flex-col sm:flex-row">
            <div className="w-full sm:w-40 h-40 sm:h-32 bg-gray-200" />
            <div className="flex-1 p-4 space-y-3">
              <div className="h-5 bg-gray-200 rounded w-3/4" />
              <div className="h-6 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="flex gap-2 px-4 py-3 bg-gray-50 border-t border-gray-100">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="flex-1 h-10 bg-gray-200 rounded-lg" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};