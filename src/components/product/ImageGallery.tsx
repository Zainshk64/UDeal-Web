'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMaximize2 } from 'react-icons/fi';
import { ProductPicture } from '@/src/api/services/HomeApi';
import { getImageUrl } from '@/src/utils/image';
import { cn } from '@/src/utils/cn';

interface ImageGalleryProps {
  pictures: ProductPicture[];
  onOpenViewer: (index: number) => void;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({
  pictures,
  onOpenViewer,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(
    new Set()
  );

  // Sort pictures: main pic first
  const sortedPictures = [...pictures].sort((a, b) => {
    if (a.IsMainPic === true) return -1;
    if (b.IsMainPic === true) return 1;
    return 0;
  });

  const goToSlide = (index: number) => {
    if (index >= 0 && index < sortedPictures.length) {
      setCurrentIndex(index);
    }
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  if (sortedPictures.length === 0) {
    return (
      <div className="w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl text-gray-400 mb-3">📷</div>
          <p className="text-gray-500 font-medium">
            No images available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gray-900 rounded-2xl overflow-hidden group">
        {!imageErrors.has(currentIndex) ? (
          <Image
            src={getImageUrl(sortedPictures[currentIndex]?.PicPath)}
            alt="Product"
            fill
            className="object-contain"
            priority
            onError={() => handleImageError(currentIndex)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500">Image not available</span>
          </div>
        )}

        {/* Fullscreen Button */}
        <button
          onClick={() => onOpenViewer(currentIndex)}
          className="absolute top-4 right-4 p-2.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
          title="View fullscreen"
        >
          <FiMaximize2 className="w-5 h-5" />
        </button>

        {/* Navigation Arrows */}
        {sortedPictures.length > 1 && (
          <>
            <button
              onClick={() => goToSlide(currentIndex - 1)}
              disabled={currentIndex === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            >
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => goToSlide(currentIndex + 1)}
              disabled={currentIndex === sortedPictures.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-all disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
            >
              <FiChevronRight className="w-6 h-6" />
            </button>
          </>
        )}

        {/* Image Counter */}
        {sortedPictures.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1.5 rounded-full text-sm font-bold">
            {currentIndex + 1} / {sortedPictures.length}
          </div>
        )}

        {/* Dot Indicators */}
        {sortedPictures.length > 1 && sortedPictures.length <= 10 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {sortedPictures.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  index === currentIndex
                    ? 'bg-[#F97316] w-6'
                    : 'bg-white/60 w-2 hover:bg-white/80'
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {sortedPictures.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {sortedPictures.map((pic, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                'relative w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                index === currentIndex
                  ? 'border-[#F97316] shadow-md'
                  : 'border-transparent hover:border-gray-300'
              )}
            >
              {!imageErrors.has(index) ? (
                <Image
                  src={getImageUrl(pic.PicPath)}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                  onError={() => handleImageError(index)}
                />
              ) : (
                <div className="w-full h-full bg-gray-300" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};