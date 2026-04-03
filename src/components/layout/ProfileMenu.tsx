"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, usePathname } from "next/navigation";
import {
  FiUser,
  FiHeart,
  FiSettings,
  FiLogOut,
  FiPackage,
} from "react-icons/fi";
import { useAuth } from "@/src/context/AuthContext";
import { logout } from "@/src/api/services/AuthApi";
import { ROUTES } from "@/src/utils/constants";
import { cn } from "@/src/utils/cn";
import { toast } from "sonner";
import { getImageUrl } from "@/src/utils/image";

interface ProfileMenuProps {
  className?: string;
}

export const ProfileMenu: React.FC<ProfileMenuProps> = ({ className }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, refreshAuth } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      refreshAuth();

      setIsOpen(false);

      // Stay on current page - only redirect if on protected route
      const protectedRoutes = [
        ROUTES.MY_ADS,
        ROUTES.ADD_POST,
        "/settings",
        ROUTES.FAVORITES,
      ];
      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );

      if (isProtected) {
        router.push(ROUTES.HOME);
      }
      // Otherwise stay on current page
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout Failed", {
        description: "Please try again.",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const menuItems = [
    {
      icon: FiUser,
      label: "My Profile",
      href: ROUTES.PROFILE,
    },
    {
      icon: FiPackage,
      label: "My Ads",
      href: ROUTES.MY_ADS,
    },
    {
      icon: FiHeart,
      label: "Favorites",
      href: ROUTES.FAVORITES,
    },
    {
      icon: FiSettings,
      label: "Settings",
      href: "/settings",
    },
  ];

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      {/* Profile Trigger */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {user?.imageurl ? (
          <img
            src={getImageUrl(user.imageurl)}
            alt={user.name || "User"}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F97316] to-[#ea580c] flex items-center justify-center text-white font-bold text-sm shadow-md">
            {user?.name?.[0]?.toUpperCase() ||
              user?.email?.[0]?.toUpperCase() ||
              "U"}
          </div>
        )}
        <div className=" md:block text-left">
          <p className="text-sm font-semibold text-gray-500">
            {user?.name?.split(" ")[0] || "User"}
          </p>
          <p className="text-xs text-gray-500">
            {user?.cityName || "Location"}
          </p>
        </div>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          >
            {/* User Info Header */}
            <div className="p-4 bg-gradient-to-br from-[#003049] to-[#004d6d] text-white">
              <div className="flex items-center gap-3">
                {user?.imageurl ? (
                  <img
                    src={getImageUrl(user.imageurl)}
                    alt={user.name || "User"}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg">
                      {user?.name?.[0]?.toUpperCase() || "U"}
                    </div>
                  </>
                )}
                <div className="min-w-0 flex-1">
                  <p className="font-semibold truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-sm text-white/80 truncate">
                    {user?.email}
                  </p>
                  {user?.cityName && (
                    <p className="text-xs text-white/60 mt-1">
                      📍 {user.cityName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => {
                    router.push(item.href);
                    setIsOpen(false);
                  }}
                  className="w-full flex cursor-pointer items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <item.icon className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700 font-medium">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Logout */}
            <div className="border-t border-gray-100 p-2">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="w-full flex items-center cursor-pointer gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <div className="w-5 h-5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                ) : (
                  <FiLogOut className="w-5 h-5" />
                )}
                <span className="font-medium">
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
