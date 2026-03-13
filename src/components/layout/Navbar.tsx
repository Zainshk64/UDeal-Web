'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiMenu,
  FiX,
  FiPlus,
  FiHeart,
  FiChevronDown,
  FiSearch,
  FiLogIn,
  FiUserPlus,
} from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES, CATEGORIES } from '@/src/utils/constants';
import { ProfileMenu } from './ProfileMenu';
import { NotificationPopup } from './NotificationPopup';
import { SearchBar } from '../ui/SearchBar';
import { Button } from '../ui/Button';
import { Container } from '../ui/Container';
import { cn } from '@/src/utils/cn';

interface NavbarProps {
  variant?: 'glass' | 'solid';
  showSearch?: boolean;
  showCategoryDropdown?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  variant = 'glass',
  showSearch = true,
  showCategoryDropdown = true,
}) => {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const categoryRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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
    document.addEventListener('mousedown', handleClickOutside);
    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, []);

  const navbarVariants = {
    glass: cn(
      'bg-white/60 backdrop-blur-lg border border-white/20',
      scrolled && 'shadow-lg'
    ),
    solid: 'bg-[#003049] border border-[#004d6d]',
  };

  const textColorClass =
    variant === 'glass' ? 'text-gray-900' : 'text-white';

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl rounded-2xl transition-all duration-300',
        navbarVariants[variant]
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
                  'text-xl font-bold',
                  variant === 'glass'
                    ? 'text-[#003049]'
                    : 'text-white'
                )}
              >
                UDeal
              </span>
              <span className="text-xl font-bold text-[#F97316]">
                Zone
              </span>
            </div>
          </Link>

          {/* ===== CENTER: Category + Search (Desktop only) ===== */}
          <div className="hidden lg:flex items-center gap-3 flex-1 max-w-2xl">
            {showCategoryDropdown && (
              <div className="relative" ref={categoryRef}>
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors',
                    variant === 'glass'
                      ? 'border-gray-200 bg-white/80 hover:border-[#F97316]'
                      : 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                  )}
                >
                  <span className="font-medium whitespace-nowrap">
                    Categories
                  </span>
                  <FiChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isCategoryOpen && 'rotate-180'
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
                            // router.push(
                            //   `${ROUTES.CATEGORY}/${cat.id}`
                            // );
                          }}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-left"
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
              />
            )}
          </div>

          {/* ===== RIGHT: Actions ===== */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Mobile Search Icon */}
            {showSearch && (
              <button
                onClick={() =>
                  setIsMobileSearchOpen(!isMobileSearchOpen)
                }
                className={cn(
                  'lg:hidden p-2.5 rounded-lg transition-colors',
                  variant === 'glass'
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-white/10'
                )}
                title="Search"
              >
                <FiSearch
                  className={cn('w-5 h-5', textColorClass)}
                />
              </button>
            )}

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={() => router.push('/favorites')}
                    className={cn(
                      'p-2.5 rounded-lg transition-colors',
                      variant === 'glass'
                        ? 'hover:bg-gray-100'
                        : 'hover:bg-white/10'
                    )}
                    title="Favorites"
                  >
                    <FiHeart
                      className={cn('w-5 h-5', textColorClass)}
                    />
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
                      'px-4 py-2 font-medium rounded-lg transition-colors hover:text-[#F97316]',
                      textColorClass
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
              <button
                onClick={() => router.push('/favorites')}
                className={cn(
                  'lg:hidden p-2.5 rounded-lg transition-colors',
                  variant === 'glass'
                    ? 'hover:bg-gray-100'
                    : 'hover:bg-white/10'
                )}
                title="Favorites"
              >
                <FiHeart
                  className={cn('w-5 h-5', textColorClass)}
                />
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                'lg:hidden p-2 rounded-lg',
                variant === 'glass'
                  ? 'hover:bg-gray-100'
                  : 'hover:bg-white/10'
              )}
            >
              {isMenuOpen ? (
                <FiX className={cn('w-6 h-6', textColorClass)} />
              ) : (
                <FiMenu
                  className={cn('w-6 h-6', textColorClass)}
                />
              )}
            </button>
          </div>
        </div>

        {/* ===== Mobile Search Overlay ===== */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden mt-3 overflow-hidden"
            >
              <div className="flex items-center gap-2">
                <SearchBar
                  variant="compact"
                  className="flex-1"
                  placeholder="Search products..."
                />
                <button
                  onClick={() => setIsMobileSearchOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ===== Mobile Menu ===== */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden overflow-"
            >
              <div className="mt-4 pt-4 border-t border-gray-200/50 space-y-2 pb-2">
                {isAuthenticated ? (
                  <>
                    {/* User Info Card */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#003049] to-[#004d6d] rounded-xl mb-3">
                      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                        {user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {user?.name || 'User'}
                        </p>
                        <p className="text-white/70 text-xs">
                          {user?.email || ''}
                        </p>
                        {user?.cityName && (
                          <p className="text-white/50 text-xs">
                            {user.cityName}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Post Ad Button */}
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
                    <Button
                      variant="secondary"
                      className="w-full"
                      icon={<FiHeart className="w-5 h-5" />}
                      onClick={() => {
                        router.push(ROUTES.ADD_POST);
                        setIsMenuOpen(false);
                      }}
                    >
                      My Ads
                    </Button>

                    <ProfileMenu/>
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