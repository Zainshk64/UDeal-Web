'use client';

import React from 'react';
import Image from 'next/image';
import { FiCalendar, FiPackage } from 'react-icons/fi';
import { getImageUrl } from '@/src/utils/image';

const DEFAULT_AVATAR =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOUpQ0yJ-GLCDwMUYymx931h0RWBEheBfF6g&s';

interface SellerHeaderProps {
  name: string;
  pic: string;
  phone: string;
  joinedDate: string;
  totalAds: number;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({
  name,
  pic,
  phone,
  joinedDate,
  totalAds,
}) => {
  const avatarUrl = pic ? getImageUrl(pic) : DEFAULT_AVATAR;

  const formatJoinDate = (iso?: string) => {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      if (isNaN(d.getTime())) return '—';
      return d.toLocaleString('en-US', {
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Seller Info */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
          <Image
            src={avatarUrl}
            alt={name}
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {name}
          </h2>
          {phone && (
            <p className="text-gray-500 text-sm mt-1">{phone}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiCalendar className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-xs">
              Member since
            </span>
          </div>
          <p className="text-gray-900 font-bold">
            {formatJoinDate(joinedDate)}
          </p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <FiPackage className="w-4 h-4 text-gray-500" />
            <span className="text-gray-500 text-xs">Total Ads</span>
          </div>
          <p className="text-gray-900 font-bold">{totalAds}</p>
        </div>
      </div>
    </div>
  );
};