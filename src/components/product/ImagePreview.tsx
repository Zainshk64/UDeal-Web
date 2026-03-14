'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiZoomIn,
  FiZoomOut,
} from 'react-icons/fi';
import { ProductPicture } from '@/src/api/services/HomeApi';
import { getImageUrl } from '@/src/utils/image';
import { cn } from '@/src/utils/cn';

interface ImageViewerProps {
  visible: boolean;
  images: ProductPicture[];
  initialIndex: number;
  onClose: () => void;
}

export const ImageViewer: React.FC<ImageViewerProps> = ({
  visible,
  images,
  initialIndex,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoom, setZoom] = useState(1);

  const sortedImages = [...images].sort((a, b) => {
    if (a.IsMainPic === true) return -1;
    if (b.IsMainPic === true) return 1;
    return 0;
  });

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setZoom(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [visible, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
        case 'Escape':
          onClose();
          break;
        case '+':
        case '=':
          setZoom((z) => Math.min(z + 0.5, 5));
          break;
        case '-':
          setZoom((z) => Math.max(z - 0.5, 1));
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, currentIndex]);

  const goToPrev = () => {
    setZoom(1);
    setCurrentIndex((prev) =>
      prev > 0 ? prev - 1 : sortedImages.length - 1
    );
  };

  const goToNext = () => {
    setZoom(1);
    setCurrentIndex((prev) =>
      prev < sortedImages.length - 1 ? prev + 1 : 0
    );
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-black/95 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6">
          <button
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <FiX className="w-6 h-6 text-white" />
          </button>

          <div className="bg-white/10 px-4 py-2 rounded-full">
            <span className="text-white font-bold text-sm">
              {currentIndex + 1} / {sortedImages.length}
            </span>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiZoomOut className="w-5 h-5 text-white" />
            </button>
            <span className="text-white text-sm font-medium w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(z + 0.5, 5))}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiZoomIn className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Main Image Area */}
        <div className="flex-1 flex items-center justify-center relative overflow-hidden px-4">
          {/* Left Arrow */}
          {sortedImages.length > 1 && (
            <button
              onClick={goToPrev}
              className="absolute left-4 sm:left-8 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiChevronLeft className="w-8 h-8 text-white" />
            </button>
          )}

          {/* Image */}
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="relative w-full h-full max-w-5xl mx-auto cursor-grab active:cursor-grabbing"
            style={{ transform: `scale(${zoom})` }}
          >
            <Image
              src={getImageUrl(
                sortedImages[currentIndex]?.PicPath
              )}
              alt={`Image ${currentIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Right Arrow */}
          {sortedImages.length > 1 && (
            <button
              onClick={goToNext}
              className="absolute right-4 sm:right-8 z-10 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            >
              <FiChevronRight className="w-8 h-8 text-white" />
            </button>
          )}
        </div>

        {/* Bottom Thumbnails */}
        {sortedImages.length > 1 && (
          <div className="p-4 sm:p-6">
            <div className="flex gap-2 justify-center overflow-x-auto scrollbar-hide">
              {sortedImages.map((pic, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentIndex(index);
                    setZoom(1);
                  }}
                  className={cn(
                    'relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all',
                    index === currentIndex
                      ? 'border-[#F97316] opacity-100'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  )}
                >
                  <Image
                    src={getImageUrl(pic.PicPath)}
                    alt={`Thumb ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Instructions */}
            <p className="text-white/40 text-xs text-center mt-3">
              ← → Arrow keys to navigate • +/- to zoom • Esc to
              close
            </p>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};