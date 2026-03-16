'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiSearch,
  FiX,
  FiFilter,
  FiMapPin,
  FiChevronDown,
  FiRefreshCw,
  FiHeart,
  FiClock,
  FiStar,
  FiGrid,
  FiList,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';

import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '@/src/components/ui/Container';
import { Pagination } from '@/src/components/seller/Pagination';
import { useAuth } from '@/src/context/AuthContext';
import { CATEGORIES, ROUTES } from '@/src/utils/constants';
import {
  getCategoryProducts,
  CategoryProduct,
} from '@/src/api/services/CategoryApi';
import { getAllCities, CityOption, getCityProductImage } from '@/src/api/services/CityApi';
import { toggleFavorite } from '@/src/api/services/HomeApi';
import { getImageUrl } from '@/src/utils/image';
import { formatCurrency } from '@/src/utils/format';
import { cn } from '@/src/utils/cn';

const PAGE_SIZE = 30;

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const catId = params?.id ? Number(params.id) : 0;

  // Find category info
  const currentCategory = CATEGORIES.find((c) => c.id === catId);

  // State
  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    user?.cityId || null
  );
  const [cities, setCities] = useState<CityOption[]>([]);
  const [citiesLoading, setCitiesLoading] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [citySearch, setCitySearch] = useState('');
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const [localFavs, setLocalFavs] = useState<Set<number>>(new Set());

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  // Fetch products
  const fetchProducts = useCallback(
    async (page: number = 1, city: number | null = selectedCityId) => {
      setLoading(true);
      const res = await getCategoryProducts(
        catId,
        page,
        PAGE_SIZE,
        city,
        user?.userId || null
      );
      setProducts(res.products);
      setTotalCount(res.meta?.[0]?.TotalCount || 0);

      // Track favorites
      const favSet = new Set<number>();
      res.products.forEach((p) => {
        if (p.IsFavorite) favSet.add(p.ProductId);
      });
      setLocalFavs(favSet);

      setLoading(false);
    },
    [catId, user?.userId, selectedCityId]
  );

  // Initial load
  useEffect(() => {
    fetchProducts(1, selectedCityId);
  }, [catId, selectedCityId]);

  // Load cities
  useEffect(() => {
    const loadCities = async () => {
      setCitiesLoading(true);
      const data = await getAllCities();
      setCities(data);
      setCitiesLoading(false);
    };
    loadCities();
  }, []);

  // Page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Search
  const handleSearch = () => {
    if (!searchInput.trim()) {
      setSearchQuery('');
      setCurrentPage(1);
      fetchProducts(1);
      return;
    }
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
    fetchProducts(1);
  };

  // City change
  const handleCitySelect = (cityId: number | null) => {
    setSelectedCityId(cityId);
    setCurrentPage(1);
    setShowCityDropdown(false);
    setCitySearch('');
  };

  // Favorite
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
        toast.success(isFav ? 'Removed from Favorites' : 'Added to Favorites');
      }
    } catch {
      toast.error('Failed to update favorite');
    }
    setFavLoading(null);
  };

  // Category switch
  const handleCategorySwitch = (newCatId: number) => {
    router.push(`/category/${newCatId}`);
  };

  // Filtered cities
  const filteredCities = cities.filter((c) =>
    c.cityName.toLowerCase().includes(citySearch.toLowerCase())
  );

  const selectedCityName =
    cities.find((c) => c.cityId === selectedCityId)?.cityName || 'All Cities';

  return (
    <>
      <Navbar variant="solid" showSearch={false} />

      <main className="pt-24 pb-8 min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#003049] to-[#004d6d] pb-6 pt-6">
          <Container>
            {/* Back + Title */}
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/10 rounded-lg"
              >
                <FiArrowLeft className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center gap-3">
                {currentCategory?.image && (
                  <Image
                    src={currentCategory.image}
                    alt=""
                    width={32}
                    height={32}
                    className="rounded-lg"
                  />
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-white">
                    {currentCategory?.name || 'Category'}
                  </h1>
                  <p className="text-white/60 text-xs">
                    {totalCount} products found
                  </p>
                </div>
              </div>
            </div>

            {/* Category Tabs - Horizontal Scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySwitch(cat.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-xl whitespace-nowrap text-sm font-medium transition-all flex-shrink-0',
                    cat.id === catId
                      ? 'bg-[#F97316] text-white'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  )}
                >
                  {cat.image && (
                    <Image
                      src={cat.image}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded"
                    />
                  )}
                  {cat.name}
                </button>
              ))}
            </div>
          </Container>
        </div>

        {/* Filters Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-20 z-30">
          <Container className="py-3">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent"
                />
                {searchInput && (
                  <button
                    onClick={() => {
                      setSearchInput('');
                      setSearchQuery('');
                      setCurrentPage(1);
                      fetchProducts(1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    <FiX className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>

              {/* City Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white hover:border-[#F97316] transition-colors w-full sm:w-auto"
                >
                  <FiMapPin className="w-4 h-4 text-gray-500" />
                  <span className="truncate max-w-[140px]">
                    {selectedCityName}
                  </span>
                  <FiChevronDown
                    className={cn(
                      'w-4 h-4 text-gray-500 transition-transform',
                      showCityDropdown && 'rotate-180'
                    )}
                  />
                </button>

                {/* City Dropdown */}
                {showCityDropdown && (
                  <div className="absolute right-0 sm:left-0 mt-1 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="relative">
                        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={citySearch}
                          onChange={(e) => setCitySearch(e.target.value)}
                          placeholder="Search cities..."
                          autoFocus
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[#F97316]"
                        />
                      </div>
                    </div>

                    <div className="max-h-48 overflow-y-auto">
                      {/* All Cities Option */}
                      <button
                        onClick={() => handleCitySelect(null)}
                        className={cn(
                          'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors',
                          !selectedCityId &&
                            'bg-[#F97316]/5 text-[#F97316] font-semibold'
                        )}
                      >
                        All Cities
                      </button>

                      {citiesLoading ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          Loading...
                        </div>
                      ) : (
                        filteredCities.map((city) => (
                          <button
                            key={city.cityId}
                            onClick={() => handleCitySelect(city.cityId)}
                            className={cn(
                              'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors',
                              selectedCityId === city.cityId &&
                                'bg-[#F97316]/5 text-[#F97316] font-semibold'
                            )}
                          >
                            {city.cityName}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="px-4 py-2.5 bg-[#F97316] text-white rounded-xl font-semibold text-sm hover:bg-[#ea580c] transition-colors flex items-center justify-center gap-2 sm:w-auto w-full"
              >
                <FiSearch className="w-4 h-4" />
                Search
              </button>
            </div>

            {/* Active Filters */}
            {(searchQuery || selectedCityId) && (
              <div className="flex flex-wrap gap-2 mt-3">
                {searchQuery && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => {
                        setSearchInput('');
                        setSearchQuery('');
                        fetchProducts(1);
                      }}
                    >
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selectedCityId && (
                  <span className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
                    City: {selectedCityName}
                    <button onClick={() => handleCitySelect(null)}>
                      <FiX className="w-3 h-3" />
                    </button>
                  </span>
                )}
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
                <span className="text-4xl">📦</span>
              </div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">
                No Products Found
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery
                  ? `No results for "${searchQuery}"`
                  : 'No products in this category yet'}
              </p>
              <button
                onClick={() => {
                  setSearchInput('');
                  setSearchQuery('');
                  handleCitySelect(null);
                  fetchProducts(1, null);
                }}
                className="bg-[#F97316] text-white px-6 py-2.5 rounded-xl font-semibold"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              {/* Products Grid */}
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
                          {/* Image */}
                          <div className="relative w-full h-40 sm:h-44 bg-gray-200 overflow-hidden">
                            {/* Badges */}
                            <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                              {product.ProductType === 'Featured' && (
                                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                                  <FiStar className="w-3 h-3" /> Featured
                                </span>
                              )}
                              {product.MarkAsSold && (
                                <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                                  SOLD
                                </span>
                              )}
                            </div>

                            {/* Favorite */}
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
                              src={getImageUrl(product.MainPicPath)}
                              alt={product.ProdcutTitle}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              // onError={(e) => {
                              //   (e.target as HTMLImageElement).src =
                              //     'https://via.placeholder.com/300x200?text=No+Image';
                              // }}
                            />
                          </div>

                          {/* Content */}
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

              {/* Pagination */}
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