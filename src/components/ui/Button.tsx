"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/src/utils/cn";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  icon,
  iconPosition = "left",
  ...props
}) => {
  const baseStyles =
    "inline-flex  cursor-pointer items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants = {
    primary:
      "bg-[#F97316] text-white hover:bg-[#ea580c] shadow-md hover:shadow-lg",
    secondary:
      "bg-[#003049] text-white hover:bg-[#004d6d] shadow-md hover:shadow-lg",
    outline:
      "border-2 border-[#003049] text-[#003049] hover:bg-[#003049] hover:text-white",
    ghost: "text-[#003049] hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm gap-2",
    md: "px-6 py-3 text-base gap-2",
    lg: "px-8 py-4 text-lg gap-3",
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {icon && iconPosition === "left" && <span>{icon}</span>}
        {children}
        {icon && iconPosition === "right" && <span>{icon}</span>}
      </motion.button>
    </>
  );
};
