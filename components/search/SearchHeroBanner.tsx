'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiSearch } from 'react-icons/fi';

interface SearchHeroBannerProps {
  searchQuery?: string;
}

export const SearchHeroBanner: React.FC<SearchHeroBannerProps> = ({ searchQuery }) => {
  return (
    <div className="relative overflow-hidden rounded-2xl mb-6">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#003049]/95 via-[#003049]/85 to-[#004d6d]/90" />
      </div>

      {/* Content */}
      <div className="relative px-6 py-12 sm:px-8 sm:py-16 md:py-20">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Icon */}
            <div className="mb-4 inline-flex items-center justify-center rounded-full bg-[#F97316]/20 p-3">
              <FiSearch className="h-6 w-6 text-[#F97316]" />
            </div>

            {/* Heading */}
            <h1 className="text-3xl font-bold text-white sm:text-4xl md:text-5xl mb-4">
              {searchQuery ? (
                <>
                  Search Results for{' '}
                  <span className="text-[#F97316]">"{searchQuery}"</span>
                </>
              ) : (
                <>
                  Find Your Perfect <span className="text-[#F97316]">Deal</span>
                </>
              )}
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-white/90 mb-6 max-w-2xl leading-relaxed">
              {searchQuery 
                ? 'Browse through our curated collection of verified listings. Use filters to narrow down your search and find exactly what you need.'
                : 'Discover thousands of products across multiple categories. Search, filter, and find the best deals in your area.'
              }
            </p>

            {/* Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                <span className="text-sm text-white/80">Verified Sellers</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                <span className="text-sm text-white/80">Secure Transactions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[#F97316]" />
                <span className="text-sm text-white/80">Best Prices</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
          <div className="absolute right-10 top-10 h-32 w-32 rounded-full border-4 border-white" />
          <div className="absolute right-32 top-32 h-20 w-20 rounded-full border-4 border-[#F97316]" />
          <div className="absolute right-20 bottom-20 h-24 w-24 rounded-full border-4 border-white" />
        </div>
      </div>
    </div>
  );
};