"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface SplashScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  duration = 2800,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-[#003049] flex flex-col items-center justify-center z-[9999]"
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <motion.div
          className="flex flex-col items-center gap-6"
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Logo instead of text "U" */}
          <div className="relative w-32 h-32 md:w-40 md:h-40">
            <Image
              src="/logo/logomain.jpg"
              alt="UdealZone Logo"
              fill
              className="object-contain drop-shadow-2xl"
              priority
            />
          </div>

          {/* Brand name */}
          <motion.h1
            className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            Udeal<span className="text-[#F97316]">Zone</span>
          </motion.h1>

          <motion.p
            className="text-xl sm:text-2xl text-slate-300 font-medium"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            Your Marketplace for everything
          </motion.p>

          <motion.p
            className="text-base sm:text-lg text-slate-500 mt-1"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.7 }}
          >
            Connecting Buyers and Sellers Instantly
          </motion.p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};