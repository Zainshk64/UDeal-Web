"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMenu,
  FiX,
  FiPlus,
  FiHeart,
  FiChevronDown,
  FiSearch,
  FiLogIn,
  FiUserPlus,
  FiUser,
  FiPackage,
  FiSettings,
  FiLogOut,
  FiShoppingBag,
  FiMessageCircle,
  FiMapPin,
} from "react-icons/fi";
import { useAuth } from "@/src/context/AuthContext";
import { useChatStore } from "@/src/stores/chatStore";
import { logout } from "@/src/api/services/AuthApi";
import { ROUTES, CATEGORIES } from "@/src/utils/constants";
import { ProfileMenu } from "./ProfileMenu";
import { NotificationPopup } from "./NotificationPopup";
import { SearchBar } from "../ui/SearchBar";
import { Button } from "../ui/Button";
import { Container } from "../ui/Container";
import { cn } from "@/src/utils/cn";
import { getImageUrl } from "@/src/utils/image";
import { toast } from "sonner";

interface NavbarProps {
  variant?: "glass" | "solid";
  showSearch?: boolean;
  showCategoryDropdown?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  variant = "glass",
  showSearch = true,
  showCategoryDropdown = true,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, refreshAuth } = useAuth();
  const unreadTotal = useChatStore((s) => s.unreadTotal);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileLoggingOut, setIsMobileLoggingOut] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close category dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryRef.current &&
        !categoryRef.current.contains(event.target as Node)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      setIsMobileCategoriesOpen(false);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  const handleMobileLogout = async () => {
    setIsMobileLoggingOut(true);
    try {
      await logout();
      refreshAuth();
      setIsMenuOpen(false);
      const protectedRoutes = [
        ROUTES.MY_ADS,
        ROUTES.ADD_POST,
        "/settings",
        ROUTES.FAVORITES,
        ROUTES.BUYERS_POST,
        ROUTES.BUYERS_MY_REQUESTS,
        ROUTES.CHAT,
      ];
      const isProtected = protectedRoutes.some((route) =>
        pathname.startsWith(route),
      );
      if (isProtected) {
        router.push(ROUTES.HOME);
      }
    } catch {
      toast.error("Logout Failed", {
        description: "Please try again.",
      });
    } finally {
      setIsMobileLoggingOut(false);
    }
  };

  const navbarVariants = {
    glass: cn(
      "bg-white/60 backdrop-blur-lg border border-white/20",
      scrolled && "shadow-lg",
    ),
    solid: "bg-[#003049] border border-[#004d6d]",
  };

  const textColorClass = variant === "glass" ? "text-gray-900" : "text-white";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl transition-all duration-300",
        navbarVariants[variant],
      )}
    >
      <Container className="py-3">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* ===== LEFT: Logo ===== */}
          <Link
            href={ROUTES.HOME}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <Image
              src="/logo/logomain.jpg"
              alt="UDealZone Logo"
              width={40}
              height={40}
              className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-lg"
            />
            <div className="hidden sm:block">
              <span
                className={cn(
                  "text-xl font-bold",
                  variant === "glass" ? "text-[#003049]" : "text-white",
                )}
              >
                UDeal
              </span>
              <span className="text-xl font-bold text-[#F97316]">Zone</span>
            </div>
          </Link>

          {/* ===== CENTER: Category + Search (Desktop only) ===== */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl">
            {showCategoryDropdown && (
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors",
                    variant === "glass"
                      ? "border-gray-200 bg-white/80 hover:border-[#F97316]"
                      : "border-white/20 bg-white/10 hover:bg-white/20 text-white",
                  )}
                >
                  <span className="font-medium whitespace-nowrap">
                    Categories
                  </span>
                  <FiChevronDown
                    className={cn(
                      "w-4 h-4 transition-transform",
                      isCategoryOpen && "rotate-180",
                    )}
                  />
                </button>

                {/* Category Dropdown */}
                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 p-2 grid grid-cols-2 gap-1 z-50"
                    >
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            setIsCategoryOpen(false);
                            router.push(`${ROUTES.CATEGORY}/${cat.id}`);
                          }}
                          className="flex items-center cursor-pointer gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
                        >
                          <img
                            src={cat.image}
                            alt=""
                            width={30}
                            className="rounded"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {cat.name}
                          </span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {showSearch && (
              <SearchBar
                variant="compact"
                className="flex-1"
                placeholder="Search products..."
                onSearch={(q) => {
                  const clean = q.trim();
                  if (!clean) return;
                  router.push(
                    `/search?q=${encodeURIComponent(clean)}`,
                  );
                }}
              />
            )}
            {showSearch && (
              <button
                onClick={() => router.push(ROUTES.SEARCH_LOCATION)}
                className={cn(
                  "shrink-0 rounded-lg border px-3 py-2.5 text-xs font-semibold transition-colors",
                  variant === "glass"
                    ? "border-gray-200 bg-white/80 text-gray-700 hover:border-[#F97316] hover:text-[#F97316]"
                    : "border-white/20 bg-white/10 text-white hover:bg-white/20",
                )}
                title="Search by location"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin className="h-4 w-4" />
                  Location
                </span>
              </button>
            )}
          </div>

          {/* ===== RIGHT: Actions ===== */}
          <div className="flex items-center gap-1 sm:gap-2">
            {showSearch && (
              <button
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className={cn(
                  "lg:hidden p-2.5 rounded-lg transition-colors",
                  variant === "glass"
                    ? "hover:bg-gray-100"
                    : "hover:bg-white/10",
                )}
                title="Search"
              >
                <FiSearch className={cn("w-5 h-5", textColorClass)} />
              </button>
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push(ROUTES.FAVORITES)}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      variant === "glass"
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10",
                    )}
                    title="Favorites"
                  >
                    <FiHeart className={cn("w-5 h-5", textColorClass)} />
                  </button>

                  <button
                    onClick={() => router.push(ROUTES.BUYERS)}
                    className={cn(
                      "p-2.5 rounded-lg transition-colors",
                      variant === "glass"
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10",
                    )}
                    title="Buyer requests"
                  >
                    <FiShoppingBag className={cn("w-5 h-5", textColorClass)} />
                  </button>

                  <button
                    onClick={() => router.push(ROUTES.CHAT)}
                    className={cn(
                      "relative p-2.5 rounded-lg transition-colors",
                      variant === "glass"
                        ? "hover:bg-gray-100"
                        : "hover:bg-white/10",
                    )}
                    title="Messages"
                  >
                    <FiMessageCircle
                      className={cn("w-5 h-5", textColorClass)}
                    />
                    {unreadTotal > 0 && (
                      <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F97316] px-0.5 text-[10px] font-bold text-white">
                        {unreadTotal > 99 ? "99+" : unreadTotal}
                      </span>
                    )}
                  </button>

                  <NotificationPopup variant={variant} />

                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FiPlus className="w-5 h-5" />}
                    onClick={() => router.push(ROUTES.ADD_POST)}
                  >
                    Post Ad
                  </Button>

                  <ProfileMenu />
                </>
              ) : (
                <>
                  <NotificationPopup variant={variant} />

                  <Link
                    href={ROUTES.LOGIN}
                    className={cn(
                      "px-4 py-2 font-medium rounded-lg transition-colors hover:text-[#F97316]",
                      textColorClass,
                    )}
                  >
                    Login
                  </Link>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => router.push(ROUTES.SIGNUP)}
                  >
                    Sign Up
                  </Button>
                </>
              )}
            </div>

            {/* Mobile: Notification Icon */}
            <div className="lg:hidden">
              <NotificationPopup variant={variant} />
            </div>

            {/* Mobile: Favorite Icon (only when logged in) */}
            {isAuthenticated && (
              <>
                <button
                  onClick={() => router.push(ROUTES.FAVORITES)}
                  className={cn(
                    "lg:hidden p-2.5 rounded-lg transition-colors",
                    variant === "glass"
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10",
                  )}
                  title="Favorites"
                >
                  <FiHeart className={cn("w-5 h-5", textColorClass)} />
                </button>
                <button
                  onClick={() => router.push(ROUTES.BUYERS)}
                  className={cn(
                    "lg:hidden p-2.5 rounded-lg transition-colors",
                    variant === "glass"
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10",
                  )}
                  title="Buyer requests"
                >
                  <FiShoppingBag className={cn("w-5 h-5", textColorClass)} />
                </button>
                <button
                  onClick={() => router.push(ROUTES.CHAT)}
                  className={cn(
                    "relative lg:hidden p-2.5 rounded-lg transition-colors",
                    variant === "glass"
                      ? "hover:bg-gray-100"
                      : "hover:bg-white/10",
                  )}
                  title="Messages"
                >
                  <FiMessageCircle className={cn("w-5 h-5", textColorClass)} />
                  {unreadTotal > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F97316] px-0.5 text-[10px] font-bold text-white">
                      {unreadTotal > 99 ? "99+" : unreadTotal}
                    </span>
                  )}
                </button>
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                "lg:hidden p-2 rounded-lg",
                variant === "glass" ? "hover:bg-gray-100" : "hover:bg-white/10",
              )}
            >
              {isMenuOpen ? (
                <FiX className={cn("w-6 h-6", textColorClass)} />
              ) : (
                <FiMenu className={cn("w-6 h-6", textColorClass)} />
              )}
            </button>
          </div>
        </div>

        {/* ===== Mobile Search Overlay ===== */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <SearchBar
                  variant="compact"
                  className="flex-1"
                  placeholder="Search products..."
                  onSearch={(q) => {
                    const clean = q.trim();
                    if (!clean) return;
                    setIsMobileSearchOpen(false);
                    router.push(
                      `${ROUTES.SEARCH}?q=${encodeURIComponent(clean)}`,
                    );
                  }}
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <button
                onClick={() => {
                  setIsMobileSearchOpen(false);
                  router.push(ROUTES.SEARCH_LOCATION);
                }}
                className="mt-2 w-full rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:border-[#F97316] hover:text-[#F97316]"
              >
                <span className="inline-flex items-center gap-1.5">
                  <FiMapPin className="h-4 w-4" />
                  Search by Location
                </span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Mobile Menu ===== */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-2 pb-2">
                {isAuthenticated ? (
                  <>
                    {/* User card — same details as desktop ProfileMenu header */}
                    <Link
                      href={ROUTES.PROFILE}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 bg-gradient-to-br from-[#003049] to-[#004d6d] rounded-xl mb-3"
                    >
                      {user?.imageurl ? (
                        <img
                          src={getImageUrl(user.imageurl)}
                          
                          alt={user.name || "User"}
                          className="w-12 h-12 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-bold text-lg shrink-0">
                          {user?.name?.[0]?.toUpperCase() ||
                            user?.email?.[0]?.toUpperCase() ||
                            "U"}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-white font-semibold text-sm truncate">
                          {user?.name || "User"}
                        </p>
                        <p className="text-white/80 text-xs truncate">
                          {user?.email || ""}
                        </p>
                        {user?.cityName && (
                          <p className="text-white/60 text-xs mt-0.5 truncate">
                            {user.cityName}
                          </p>
                        )}
                      </div>
                    </Link>

                    <Button
                      variant="primary"
                      className="w-full"
                      icon={<FiPlus className="w-5 h-5" />}
                      onClick={() => {
                        router.push(ROUTES.ADD_POST);
                        setIsMenuOpen(false);
                      }}
                    >
                      Post Ad
                    </Button>

                    <div className="space-y-1 rounded-xl border border-gray-200 bg-white p-1">
                      <Link
                        href={ROUTES.PROFILE}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiUser className="w-5 h-5 text-gray-500 shrink-0" />
                        My Profile
                      </Link>
                      <Link
                        href={ROUTES.MY_ADS}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiPackage className="w-5 h-5 text-gray-500 shrink-0" />
                        My Ads
                      </Link>
                      <Link
                        href={ROUTES.FAVORITES}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiHeart className="w-5 h-5 text-gray-500 shrink-0" />
                        Favorites
                      </Link>
                      <Link
                        href={ROUTES.BUYERS}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiShoppingBag className="w-5 h-5 text-gray-500 shrink-0" />
                        Buyer requests
                      </Link>
                      <Link
                        href={ROUTES.BUYERS_MY_REQUESTS}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiShoppingBag className="w-5 h-5 text-gray-500 shrink-0" />
                        My buyer requests
                      </Link>
                      <Link
                        href={ROUTES.CHAT}
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiMessageCircle className="w-5 h-5 text-gray-500 shrink-0" />
                        Messages
                        {unreadTotal > 0 && (
                          <span className="ml-auto rounded-full bg-[#F97316] px-2 py-0.5 text-xs font-bold text-white">
                            {unreadTotal > 99 ? "99+" : unreadTotal}
                          </span>
                        )}
                      </Link>
                      <Link
                        href="/settings"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50"
                      >
                        <FiSettings className="w-5 h-5 text-gray-500 shrink-0" />
                        Settings
                      </Link>
                    </div>

                    <button
                      type="button"
                      onClick={handleMobileLogout}
                      disabled={isMobileLoggingOut}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {isMobileLoggingOut ? (
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <FiLogOut className="h-5 w-5" />
                      )}
                      {isMobileLoggingOut ? "Logging out..." : "Logout"}
                    </button>

                    {showCategoryDropdown && (
                      <div className="mt-2 border-t border-gray-200 pt-3">
                        <button
                          type="button"
                          onClick={() =>
                            setIsMobileCategoriesOpen(!isMobileCategoriesOpen)
                          }
                          className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-left text-sm font-semibold text-gray-800 hover:bg-gray-50"
                        >
                          <span>Categories</span>
                          <FiChevronDown
                            className={cn(
                              "h-5 w-5 text-gray-500 transition-transform",
                              isMobileCategoriesOpen && "rotate-180",
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {isMobileCategoriesOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-2 max-h-64 space-y-1 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-2">
                                {CATEGORIES.map((cat) => (
                                  <button
                                    key={`mobile-cat-${cat.id}`}
                                    type="button"
                                    onClick={() => {
                                      router.push(
                                        `${ROUTES.CATEGORY}/${cat.id}`,
                                      );
                                      setIsMenuOpen(false);
                                    }}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-white"
                                  >
                                    <img
                                      src={cat.image}
                                      alt=""
                                      width={28}
                                      height={28}
                                      className="rounded object-cover"
                                    />
                                    <span className="font-medium">
                                      {cat.name}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {/* Login Button */}
                    <Link
                      href={ROUTES.LOGIN}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <FiLogIn className="w-5 h-5" />
                      <span className="font-medium">Login</span>
                    </Link>

                    {/* Sign Up Button */}
                    <Button
                      variant="primary"
                      className="w-full"
                      icon={<FiUserPlus className="w-5 h-5" />}
                      onClick={() => {
                        router.push(ROUTES.SIGNUP);
                        setIsMenuOpen(false);
                      }}
                    >
                      Create Account
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </motion.nav>
  );
};
