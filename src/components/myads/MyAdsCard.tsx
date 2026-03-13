'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiCheckCircle, FiEye, FiMoreVertical } from 'react-icons/fi';
import { FaCheck } from 'react-icons/fa';
import { MyAdItem } from '@/src/api/services/MyAdsApi';
import { getImageUrl } from '@/src/utils/image';
import { formatCurrency } from '@/src/utils/format';

interface MyAdsCardProps {
  ad: MyAdItem;
  onEdit?: (ad: MyAdItem) => void;
  onDelete?: (productId: number) => Promise<void>;
  onMarkAsSold?: (productId: number) => Promise<void>;
  isLoading?: boolean;
}

export const MyAdsCard: React.FC<MyAdsCardProps> = ({
  ad,
  onEdit,
  onDelete,
  onMarkAsSold,
  isLoading = false,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMarkingSold, setIsMarkingSold] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (onDelete) {
        await onDelete(ad.productId);
      }
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  const handleMarkAsSold = async () => {
    setIsMarkingSold(true);
    try {
      if (onMarkAsSold) {
        await onMarkAsSold(ad.productId);
      }
    } finally {
      setIsMarkingSold(false);
      setShowMenu(false);
    }
  };

  const imageUrl = getImageUrl(ad.image);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow group"
    >
      {/* Image Section */}
      <div className="relative w-full h-40 bg-gray-200 overflow-hidden">
        {ad.markAsSold && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <div className="bg-red-600 text-white px-4 py-1 rounded font-bold">
              SOLD
            </div>
          </div>
        )}

        {!imageError ? (
          <Image
            src={imageUrl}
            alt={ad.prodcutTitle}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-300">
            <span className="text-gray-500 text-sm">No image</span>
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {ad.isFeatured && (
            <span className="px-2 py-1 bg-yellow-500 text-white text-xs font-semibold rounded">
              Featured
            </span>
          )}
          {ad.enable && (
            <span className="px-2 py-1 bg-green-500 text-white text-xs font-semibold rounded flex items-center gap-1">
              <FaCheck className="w-3 h-3" />
              Active
            </span>
          )}
        </div>

        {/* More Menu Button */}
        <div className="absolute top-3 right-3">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 bg-white rounded-full shadow hover:shadow-md transition-shadow"
          >
            <FiMoreVertical className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Menu Dropdown */}
        <AnimatePresence>
          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-12 right-3 bg-white rounded-lg shadow-lg z-20 min-w-max border border-gray-200"
            >
              <button
                onClick={() => {
                  onEdit?.(ad);
                  setShowMenu(false);
                }}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left flex items-center gap-2 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 border-b border-gray-200"
              >
                <FiEdit2 className="w-4 h-4" />
                Edit
              </button>
              {!ad.markAsSold && (
                <button
                  onClick={handleMarkAsSold}
                  disabled={isLoading || isMarkingSold}
                  className="w-full px-4 py-2 text-left flex items-center gap-2 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-50 border-b border-gray-200"
                >
                  {isMarkingSold ? (
                    <>
                      <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                      Marking...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-4 h-4" />
                      Mark as Sold
                    </>
                  )}
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={isLoading || isDeleting}
                className="w-full px-4 py-2 text-left flex items-center gap-2 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-sm">
          {ad.prodcutTitle}
        </h3>

        {/* Price */}
        <p className="text-[#F97316] font-bold text-lg mb-3">
          {formatCurrency(ad.price, 'PKR')}
        </p>

        {/* Address */}
        <p className="text-gray-600 text-xs line-clamp-1 mb-3">{ad.address}</p>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-200 pt-3">
          <div className="flex items-center gap-1">
            <FiEye className="w-4 h-4" />
            <span>{ad.viewsCount} views</span>
          </div>
          <span className="text-gray-400">
            {new Date(ad.createdDateTime).toLocaleDateString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default MyAdsCard;
