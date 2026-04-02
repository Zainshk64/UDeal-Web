"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/utils/cn";

interface CategoryChipProps {
  name: string;
  icon: string;
  image?: string;
  onClick?: () => void;
  className?: string;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({
  name,
  icon,
  image,
  onClick,
  className,
}) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center cursor-pointer p-4 rounded-xl transition-all duration-300 group",
        className,
      )}
    >
      {/* Icon/Image */}
      <div className="w-20 h-20 mb-2 px-2 rounded-xl flex items-center justify-center shadow-md text-3xl group-hover:from-[#F97316]/20 group-hover:to-[#F97316]/10 transition-all">
        {image ? (
          <img src={image} alt={name} className="object-contain" />
        ) : (
          <span>{icon}</span>
        )}
      </div>

      {/* Label */}
      <span className="text-sm font-semibold text-gray-700 text-center group-hover:text-[#F97316] transition-colors">
        {name}
      </span>
    </motion.button>
  );
};
