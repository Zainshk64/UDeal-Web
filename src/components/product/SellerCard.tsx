"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FiUser, FiPhone, FiFlag, FiChevronRight } from "react-icons/fi";
import { ProductDetail, ProductMetaData } from "@/src/api/services/HomeApi";
import { getImageUrl } from "@/src/utils/image";
import { useAuth } from "@/src/context/AuthContext";
import { toast } from "sonner";

interface SellerCardProps {
  metaData: ProductMetaData;
  detail: ProductDetail;
  onReport: () => void;
}

const DEFAULT_AVATAR =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOUpQ0yJ-GLCDwMUYymx931h0RWBEheBfF6g&s";

export const SellerCard: React.FC<SellerCardProps> = ({
  metaData,
  detail,
  onReport,
}) => {
  const { isAuthenticated } = useAuth();

  if (!metaData?.Uid) return null;

  const avatarUrl = metaData.PicPath
    ? getImageUrl(metaData.PicPath)
    : DEFAULT_AVATAR;

  const handleCallClick = () => {
    if (!isAuthenticated) {
      toast.info("Login Required", {
        description: "Please login to see contact number",
      });
      return;
    }
    if (metaData.MobileNo) {
      window.open(`tel:${metaData.MobileNo}`, "_self");
    }
  };

  const handleChatClick = () => {
    if (!isAuthenticated) {
      toast.info("Login Required", {
        description: "Please login to chat with the seller",
      });
      return;
    }
    toast.info("Coming Soon", {
      description: "Chat feature will be available soon",
    });
  };

  const handleReportClick = () => {
    if (!isAuthenticated) {
      toast.info("Login Required", {
        description: "Please login to report this ad",
      });
      return;
    }
    onReport();
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-gray-100">
        <div className="w-9 h-9 bg-yellow-100 rounded-xl flex items-center justify-center">
          <FiUser className="w-5 h-5 text-amber-600" />
        </div>
        <h3 className="text-lg font-bold text-[#003049]">Ad Posted By</h3>
      </div>

      {/* Seller Info */}
      <div className="p-4">
        <Link
          href={`${isAuthenticated ? `/seller/${metaData.Uid}?name=${encodeURIComponent(metaData.Name || "Seller")}&pic=${encodeURIComponent(metaData.PicPath || "")}&phone=${encodeURIComponent(metaData.MobileNo || "")}&joined=${encodeURIComponent(metaData.JoinedDate || "")}&totalAds=${metaData.TotalAdsPosted || 0}` : "/auth/login"}`}
          className="flex items-center gap-3 group"
        >
          <div className="w-14 h-14 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
            <Image
              src={avatarUrl}
              alt={metaData.Name || "Seller"}
              width={56}
              height={56}
              className="w-14 h-14 object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold group-hover:text-[#F97316] transition-colors truncate">
              {metaData.Name || "Seller"}
            </p>
            {isAuthenticated && metaData.MobileNo ? (
              <p className="text-gray-500 text-sm mt-0.5">
                {metaData.MobileNo}
              </p>
            ) : (
              <p className="text-gray-400 text-sm mt-0.5">
                Login to see number
              </p>
            )}
          </div>
          <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#F97316] transition-colors" />
        </Link>

        {/* Divider */}
        <div className="h-px bg-gray-100 my-4" />

        {/* Action Buttons */}
        {!detail.IsOwner && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCallClick}
              className="flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold transition-colors"
            >
              <FiPhone className="w-5 h-5" />
              Call
            </button>

            <button
              onClick={handleChatClick}
              className="flex items-center justify-center gap-2 py-3 bg-[#F97316] hover:bg-[#ea580c] text-white rounded-xl font-semibold transition-colors"
            >
              💬 Chat
            </button>
          </div>
        )}

        {/* Divider */}
        {!detail.IsOwner && (
          <>
            <div className="h-px bg-gray-100 my-4" />

            {/* Report Button */}
            <button
              onClick={handleReportClick}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="w-9s h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center group-hover:border-red-300 transition-colors">
                <FiFlag className="w-4 h-4 text-red-500" />
              </div>
              <span className="text-red-600 font-semibold group-hover:text-red-700 transition-colors">
                Report this ad
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
