'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiClock, FiStar, FiEye } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { SellerProduct } from '@/src/api/services/SellerApi';
import { getImageUrl } from '@/src/utils/image';
import { useAuth } from '@/src/context/AuthContext';
import { cn } from '@/src/utils/cn';
import { useFavorite } from '@/hooks/useFavorite';

interface SellerProductCardProps {
  product: SellerProduct;
}

const getTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 5) return `${diffWeeks}w ago`;
  return `${diffMonths}mo ago`;
};

export const SellerProductCard: React.FC<SellerProductCardProps> = ({
  product,
}) => {
  const { isAuthenticated } = useAuth();
  const { loadingFavId, handleFavoriteToggle } = useFavorite();
  const [isFavorited, setIsFavorited] = useState(false);
  const [imageError, setImageError] = useState(false);

  const isLoadingFav = loadingFavId === product.productId;
  const imageUrl = getImageUrl(product.image);

  const handleFavClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    await handleFavoriteToggle(
      product.productId,
      isFavorited,
      () => {
        setIsFavorited((prev) => !prev);
      }
    );
  };

  return (
    <Link href={`/product/${product.productId}`}>
      <motion.div
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 group cursor-pointer h-full flex flex-col"
        whileHover={{ translateY: -4 }}
      >
        {/* Image */}
        <div className="relative w-full h-44 sm:h-48 bg-gray-200 overflow-hidden">
          {/* Badges */}
          <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
            {product.isFeatured && (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <FiStar className="w-3 h-3" />
                Featured
              </span>
            )}
            {product.markAsSold && (
              <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                Sold
              </span>
            )}
          </div>

          {/* Favorite */}
          <button
            onClick={handleFavClick}
            disabled={isLoadingFav}
            className="absolute top-3 right-3 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all"
          >
            {isLoadingFav ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#F97316] rounded-full animate-spin" />
            ) : isFavorited ? (
              <FaHeart className="w-5 h-5 text-[#F97316]" />
            ) : (
              <FiHeart className="w-5 h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" />
            )}
          </button>

          {!imageError ? (
            <Image
              src={imageUrl}
              alt={product.prodcutTitle}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-lg font-bold text-[#F97316]">
            Rs {product.price?.toLocaleString()}
          </p>

          <h3 className="text-base font-semibold text-[#003049] mt-1 line-clamp-1">
            {product.prodcutTitle}
          </h3>

          {product.productDescription && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.productDescription}
            </p>
          )}

          <div className="mt-auto pt-3 flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <FiMapPin className="w-3.5 h-3.5" />
              <span className="line-clamp-1">
                {product.address?.split('|')[0]?.trim() || 'Pakistan'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <FiClock className="w-3.5 h-3.5" />
              <span>{getTimeAgo(product.createdDateTime)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};