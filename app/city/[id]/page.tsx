'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiMapPin,
  FiClock,
  FiStar,
  FiHeart,
  FiChevronDown,
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';

import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '@/src/components/ui/Container';
import { Pagination } from '@/src/components/seller/Pagination';
import { useAuth } from '@/src/context/AuthContext';
import {
  getCityProducts,
  getAllCities,
  getCityProductImage,
  CityProduct,
  CityOption,
} from '@/src/api/services/CityApi';
import { toggleFavorite } from '@/src/api/services/HomeApi';
import { formatCurrency } from '@/src/utils/format';
import { cn } from '@/src/utils/cn';

const PAGE_SIZE = 30;

export default function CityPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const cityId = params?.id ? Number(params.id) : 0;

  // State
  const [products, setProducts] = useState<CityProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [showCitySwitcher, setShowCitySwitcher] = useState(false);
  const [citySwitchSearch, setCitySwitchSearch] = useState('');
  const [selectedCityId, setSelectedCityId] = useState(cityId);
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const [localFavs, setLocalFavs] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentCityName =
    cities.find((c) => c.cityId === selectedCityId)?.cityName || 'City';

  // Fetch products
  const fetchProducts = useCallback(
    async (page: number = 1, cId: number = selectedCityId) => {
      setLoading(true);
      const res = await getCityProducts(
        cId,
        page,
        PAGE_SIZE,
        user?.userId || null
      );
      setProducts(res.products);
      setTotalCount(res.meta?.[0]?.TotalCount || 0);

      const favSet = new Set<number>();
      res.products.forEach((p) => {
        if (p.IsFavorite) favSet.add(p.ProductId);
      });
      setLocalFavs(favSet);

      setLoading(false);
    },
    [selectedCityId, user?.userId]
  );

  useEffect(() => {
    fetchProducts(1, selectedCityId);
  }, [selectedCityId]);

  useEffect(() => {
    const load = async () => {
      const data = await getAllCities();
      setCities(data);
    };
    load();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCitySwitch = (newCityId: number) => {
    setSelectedCityId(newCityId);
    setCurrentPage(1);
    setShowCitySwitcher(false);
    setCitySwitchSearch('');
    // Update URL without full reload
    window.history.replaceState(null, '', `/city/${newCityId}`);
  };

  const handleFavorite = async (productId: number) => {
    if (!isAuthenticated || !user?.userId) {
      toast.info('Login Required', {
        description: 'Please login to add favorites',
      });
      return;
    }

    setFavLoading(productId);
    try {
      const isFav = localFavs.has(productId);
      const result = await toggleFavorite(productId, user.userId);
      if (result.success) {
        setLocalFavs((prev) => {
          const next = new Set(prev);
          if (isFav) next.delete(productId);
          else next.add(productId);
          return next;
        });
        toast.success(
          isFav ? 'Removed from Favorites' : 'Added to Favorites'
        );
      }
    } catch {
      toast.error('Failed to update favorite');
    }
    setFavLoading(null);
  };

  const filteredSwitchCities = cities.filter((c) =>
    c.cityName.toLowerCase().includes(citySwitchSearch.toLowerCase())
  );

  return (
    <>
      {/* <Navbar variant="solid" showSearch={false} /> */}

      <main className="pt-24 pb-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003049] to-[#004d6d] py-8">
          <Container>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-white/10 rounded-lg"
                >
                  <FiArrowLeft className="w-5 h-5 text-white" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-5 h-5 text-[#F97316]" />
                    <h1 className="text-xl sm:text-2xl font-bold text-white">
                      {currentCityName}
                    </h1>
                  </div>
                  <p className="text-white/60 text-xs mt-1">
                    {totalCount} products found
                  </p>
                </div>
              </div>

              {/* City Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowCitySwitcher(!showCitySwitcher)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-medium"
                >
                  <FiMapPin className="w-4 h-4" />
                  Change City
                  <FiChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      showCitySwitcher && 'rotate-180'
                    )}
                  />
                </button>

                {showCitySwitcher && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl border shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={citySwitchSearch}
                          onChange={(e) =>
                            setCitySwitchSearch(e.target.value)
                          }
                          placeholder="Search cities..."
                          autoFocus
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97316]"
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                      {filteredSwitchCities.map((city) => (
                        <button
                          key={city.cityId}
                          onClick={() => handleCitySwitch(city.cityId)}
                          className={cn(
                            'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50',
                            selectedCityId === city.cityId &&
                              'bg-[#F97316]/5 text-[#F97316] font-semibold'
                          )}
                        >
                          {city.cityName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Other Cities Quick Chips */}
            {cities.length > 0 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                {cities.slice(0, 10).map((city) => (
                  <button
                    key={city.cityId}
                    onClick={() => handleCitySwitch(city.cityId)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap flex-shrink-0 transition-all',
                      selectedCityId === city.cityId
                        ? 'bg-[#F97316] text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    )}
                  >
                    {city.cityName}
                  </button>
                ))}
              </div>
            )}
          </Container>
        </div>

        {/* Products */}
        <Container className="py-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-xl overflow-hidden animate-pulse"
                >
                  <div className="w-full h-44 bg-gray-200" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-5 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <FiMapPin className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Products in {currentCityName}
              </h3>
              <p className="text-gray-500">Try selecting a different city</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product, idx) => {
                  const isFav = localFavs.has(product.ProductId);
                  const isFavLoading = favLoading === product.ProductId;

                  return (
                    <motion.div
                      key={product.ProductId}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                    >
                      <Link href={`/product/${product.ProductId}`}>
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full flex flex-col group">
                          <div className="relative w-full h-40 sm:h-44 bg-gray-200 overflow-hidden">
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                              {product.IsFeatured && (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                  <FiStar className="w-3 h-3" /> Featured
                                </span>
                              )}
                            </div>

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleFavorite(product.ProductId);
                              }}
                              disabled={isFavLoading}
                              className="absolute top-2 right-2 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md"
                            >
                              {isFavLoading ? (
                                <div className="w-4 h-4 border-2 border-gray-300 border-t-[#F97316] rounded-full animate-spin" />
                              ) : isFav ? (
                                <FaHeart className="w-4 h-4 text-[#F97316]" />
                              ) : (
                                <FiHeart className="w-4 h-4 text-gray-400" />
                              )}
                            </button>

                            <Image
                              src={getCityProductImage(product.MainPicPath)}
                              alt={product.ProdcutTitle}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'https://via.placeholder.com/300x200?text=No+Image';
                              }}
                            />
                          </div>

                          <div className="flex-1 p-3 flex flex-col">
                            <h3 className="font-semibold text-gray-900 text-xs sm:text-sm line-clamp-2 mb-1">
                              {product.ProdcutTitle}
                            </h3>
                            <p className="text-[#F97316] font-bold text-sm sm:text-base mt-auto">
                              {formatCurrency(product.Price, 'PKR')}
                            </p>
                            <div className="flex items-center gap-1 text-gray-500 text-[10px] sm:text-xs mt-1">
                              <FiMapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="line-clamp-1">
                                {product.Address}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-gray-400 text-[10px] sm:text-xs mt-0.5">
                              <FiClock className="w-3 h-3 flex-shrink-0" />
                              <span>{product.TimeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </Container>
      </main>

      {/* <Footer /> */}
    </>
  );
}