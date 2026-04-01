'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  FiEye,
  FiEdit2,
  FiTag,
  FiStar,
  FiTrash2,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';
import { MyAdItem } from '@/src/api/services/MyAdsApi';
import { getImageUrl } from '@/src/utils/image';
import { cn } from '@/src/utils/cn';

interface MyAdCardProps {
  ad: MyAdItem;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onMarkSold: (id: number) => void;
  onFeature: (id: number, title: string) => void;
  onDelete: (id: number) => void;
  actionLoading: { id: number; type: string } | null;
  featureLoading: number | null;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays < 1) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
};

export const MyAdCard: React.FC<MyAdCardProps> = ({
  ad,
  onView,
  onEdit,
  onMarkSold,
  onFeature,
  onDelete,
  actionLoading,
  featureLoading,
}) => {
  const isThisLoading = actionLoading?.id === ad.productId;
  const loadingType = actionLoading?.type;
  const isFeatureLoading = featureLoading === ad.productId;
  const [imgError, setImgError] = React.useState(false);

  const statusBadge = () => {
    if (ad.markAsSold) return { label: 'Sold', color: 'bg-gray-500' };
    if (!ad.enable) return { label: 'Pending Review', color: 'bg-yellow-500' };
    return { label: 'Active', color: 'bg-green-500' };
  };

  const status = statusBadge();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Main Content Row */}
      <div className="flex flex-col sm:flex-row">
        {/* Image */}
        <div className="relative w-full sm:w-44 h-44 sm:h-auto bg-gray-200 flex-shrink-0 overflow-hidden">
          {!imgError && ad.image ? (
            <Image
              src={getImageUrl(ad.image)}
              alt={ad.prodcutTitle}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-300">
              <span className="text-gray-500 text-sm">No Image</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            <span className={cn('px-2 py-0.5 rounded text-white text-[10px] font-bold', status.color)}>
              {status.label}
            </span>
            {ad.isFeatured && !ad.markAsSold && ad.enable && (
              <span className="px-2 py-0.5 rounded bg-purple-600 text-white text-[10px] font-bold">
                Featured
              </span>
            )}
          </div>

          {/* Views */}
          {ad.viewsCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/60 px-2 py-1 rounded-full flex items-center gap-1">
              <FiEye className="w-3 h-3 text-white" />
              <span className="text-white text-[10px]">{ad.viewsCount}</span>
            </div>
          )}
        </div>

        {/* Details */}
        <Link href={`/product/${ad.productId}`} className="flex-1 p-4 min-w-0 hover:bg-gray-50/50 transition-colors">
          <h3 className="text-sm font-bold text-[#003049] truncate">
            {ad.prodcutTitle}
          </h3>
          {ad.productDescription && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {ad.productDescription}
            </p>
          )}
          <p className="text-base font-bold text-[#F97316] mt-2">
            Rs {ad.price.toLocaleString()}
          </p>

          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-1 text-gray-500">
              <FiMapPin className="w-3 h-3" />
              <span className="text-[11px] truncate max-w-[120px]">
                {ad.address?.split('|')[0]?.trim() || 'No location'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-gray-400">
              <FiClock className="w-3 h-3" />
              <span className="text-[11px]">{formatDate(ad.createdDateTime)}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 px-3 py-2.5 bg-gray-50 border-t border-gray-100 overflow-x-auto scrollbar-hide">
        {/* View */}
        <ActionBtn
          icon={<FiEye />}
          label="View"
          color="text-gray-600"
          bgColor="bg-gray-200"
          onClick={() => onView(ad.productId)}
        />

        {/* Edit */}
        <ActionBtn
          icon={<FiEdit2 />}
          label="Edit"
          color="text-blue-600"
          bgColor="bg-blue-100"
          onClick={() => onEdit(ad.productId)}
          disabled={isThisLoading || ad.markAsSold}
        />

        {/* Mark Sold */}
        <ActionBtn
          icon={
            isThisLoading && loadingType === 'sold' ? (
              <div className="w-4 h-4 border-2 border-orange-300 border-t-orange-600 rounded-full animate-spin" />
            ) : (
              <FiTag />
            )
          }
          label={ad.markAsSold ? 'Sold' : 'Mark Sold'}
          color={ad.markAsSold ? 'text-gray-400' : 'text-orange-600'}
          bgColor={ad.markAsSold ? 'bg-gray-200' : 'bg-orange-100'}
          onClick={() => onMarkSold(ad.productId)}
          disabled={isThisLoading || ad.markAsSold || !ad.enable}
        />

        {/* Feature */}
        <ActionBtn
          icon={
            isFeatureLoading ? (
              <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
            ) : (
              <FiStar className={ad.isFeatured ? 'fill-current' : ''} />
            )
          }
          label={ad.isFeatured ? 'Featured' : 'Feature'}
          color={ad.isFeatured ? 'text-purple-400' : 'text-purple-600'}
          bgColor={ad.isFeatured ? 'bg-purple-200' : 'bg-purple-100'}
          onClick={() => onFeature(ad.productId, ad.prodcutTitle)}
          disabled={isThisLoading || ad.markAsSold || !ad.enable || ad.isFeatured || isFeatureLoading}
        />

        {/* Delete */}
        <ActionBtn
          icon={
            isThisLoading && loadingType === 'delete' ? (
              <div className="w-4 h-4 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <FiTrash2 />
            )
          }
          label="Delete"
          color="text-red-500"
          bgColor="bg-red-100"
          onClick={() => onDelete(ad.productId)}
          disabled={isThisLoading}
        />
      </div>
    </div>
  );
};

// Helper button component
const ActionBtn: React.FC<{
  icon: React.ReactNode;
  label: string;
  color: string;
  bgColor: string;
  onClick: () => void;
  disabled?: boolean;
}> = ({ icon, label, color, bgColor, onClick, disabled }) => (
  <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }}
    disabled={disabled}
    className={cn(
      'flex flex-col items-center justify-center min-w-[60px] flex-1 py-1.5 rounded-lg transition-colors',
      disabled ? 'opacity-40 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
    )}
  >
    <div className={cn('w-8 h-8 rounded-full flex items-center justify-center mb-0.5 text-sm', bgColor, color)}>
      {icon}
    </div>
    <span className={cn('text-[10px] font-medium', color)}>{label}</span>
  </button>
);