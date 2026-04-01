"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiHeart, FiMapPin, FiClock, FiStar } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { HomeAd } from "@/src/api/services/HomeApi";
import { getImageUrl } from "@/src/utils/image";
import { formatCurrency, formatTimeAgo } from "@/src/utils/format";
import { useAuth } from "@/src/context/AuthContext";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/src/utils/constants";
import { cn } from "@/src/utils/cn";

interface ProductCardProps {
  product: HomeAd;
  onFavoriteToggle?: (productId: number, isFavorited: boolean) => Promise<void>;
  showDistance?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onFavoriteToggle,
  showDistance = false,
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [isFavorited, setIsFavorited] = useState(product.IsFavorite || false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    setIsLoadingFavorite(true);
    try {
      if (onFavoriteToggle) {
        await onFavoriteToggle(product.ProductId, !isFavorited);
      }
      setIsFavorited(!isFavorited);
    } catch (error) {
      console.error("Error toggling favorite:", error);
      // Revert state if API fails
      setIsFavorited(isFavorited);
      alert("Failed to update favorite. Please try again.");
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  const imageUrl = getImageUrl(product.PicPath);

  return (
<Link href={`${ROUTES.PRODUCT_DETAIL}/${product.ProductId}?isGeneral=true`}>
      <motion.div
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300 h-full flex flex-col cursor-pointer group"
        whileHover={{ translateY: -4 }}
        transition={{ duration: 0.2 }}
      >
        {/* Image Section */}
        <div className="relative w-full h-48 bg-gray-200 overflow-hidden">
          {/* Product Type Badge */}
          {(product.ProductType === "Featured" || product.MarkAsSold) && (
            <div className="absolute top-3 left-3 z-10">
              {product.ProductType === "Featured" && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <FiStar className="w-3 h-3" />
                  Featured
                </div>
              )}
              {product.MarkAsSold && (
                <div className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold transform -rotate-12 mt-2">
                  SOLD
                </div>
              )}
            </div>
          )}

          {!imageError ? (
            <Image
              src={imageUrl}
              alt={product.ProdcutTitle}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-sm">No image</span>
            </div>
          )}

          {/* Favorite Button - Moved to top right */}
          <motion.button
            onClick={handleFavoriteClick}
            disabled={isLoadingFavorite}
            className="absolute top-3 cursor-pointer right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:shadow-lg transition-all z-20"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isLoadingFavorite ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-[#F97316] rounded-full animate-spin" />
            ) : isFavorited ? (
              <FaHeart className="w-5 h-5 text-[#F97316]" />
            ) : (
              <FiHeart className="w-5 h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" />
            )}
          </motion.button>
        </div>

        {/* Content Section */}
        <div className="flex-1 p-4 flex flex-col">
          {/* Title */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-md">
            {product.ProdcutTitle}
          </h3>
          <h3 className=" text-black/60 line-clamp-2 text-sm">
            {product.ProductDescription.slice(0, 30)}...
          </h3>

          {/* Price */}
          <div className="mb-3 mt-auto">
            <p className="text-[#F97316] font-bold text-lg">
              {formatCurrency(product.Price, "PKR")}
            </p>
          </div>

          {/* Location & Distance */}
          <div className="flex items-center gap-1 text-gray-600 text-xs mb-1">
            <FiMapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="line-clamp-1">{product.Address}</span>
            {showDistance && product.DistanceKm && (
              <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                {product.DistanceKm.toFixed(1)}km
              </span>
            )}
          </div>

          {/* Time Ago */}
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <FiClock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{product.TimeAgo}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default ProductCard;
