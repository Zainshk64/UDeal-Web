'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  FiSearch,
  FiX,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';

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
import { CATEGORIES, ROUTES } from '@/src/utils/constants';

const PAGE_SIZE = 30;

export default function CityPageClient() {
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
  const [selectedCityId, setSelectedCityId] = useState(cityId);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
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

  const handleCityChange = (newCityId: number) => {
    setSelectedCityId(newCityId);
    setCurrentPage(1);
    setIsMobileFiltersOpen(false);
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

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setCurrentPage(1);
  };

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchQuery
        ? true
        : product.ProdcutTitle.toLowerCase().includes(searchQuery.toLowerCase());
      const priceOk =
        (!minPrice || product.Price >= Number(minPrice)) &&
        (!maxPrice || product.Price <= Number(maxPrice));
      return matchesSearch && priceOk;
    });
  }, [products, searchQuery, minPrice, maxPrice]);

  const cityQuery = `?cityId=${selectedCityId}`;

  return (
    <main className="min-h-screen bg-gray-50">
        {/* Hero Banner */}
      <section className="relative py-20 overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#003049] via-[#00496b] to-[#006d96]" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#F97316]/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 w-64 h-64 bg-[#F97316]/5 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        <Container className="relative z-10 py-16 md:py-24">
          <div className="max-w-2xl text-white">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white/90 transition-colors">
                Home
              </Link>
              <span className="text-white/30">/</span>
              <span>City</span>
              <span className="text-white/30">/</span>
              <span className="text-[#F97316] font-medium">
                {currentCityName}
              </span>
            </nav>

            {/* Title with Icon */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 shrink-0">
                <FiMapPin className="w-7 h-7 text-[#F97316]" />
              </div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Deals in {currentCityName}
              </h1>
            </div>

            {/* Description */}
            <p className="text-white/75 text-sm md:text-base max-w-lg leading-relaxed">
              Browse the latest listings from trusted sellers in{" "}
              {currentCityName}. Find great deals, compare prices, and connect
              with local sellers.
            </p>

            {/* Stats Pills */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                <FiMapPin className="w-4 h-4 text-[#F97316]" />
                <span className="text-sm text-white/90 font-medium">
                  {currentCityName}
                </span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-4">
        {/* Category capsules */}
        <div className="mb-4 flex justify-center gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`${ROUTES.CATEGORY}/${cat.id}${cityQuery}`)}
              className={cn(
                'whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition',
                'border-gray-200 bg-white text-gray-700 hover:border-[#F97316] hover:text-[#F97316]'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Sidebar Filters */}
          <aside
            className={cn(
              'lg:col-span-3',
              isMobileFiltersOpen ? 'block' : 'hidden',
              'lg:block'
            )}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sticky top-28">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => {
                    setMinPrice('');
                    setMaxPrice('');
                    setSearchInput('');
                    setSearchQuery('');
                    setSelectedCityId(cityId);
                    setCurrentPage(1);
                    setIsMobileFiltersOpen(false);
                    window.history.replaceState(null, '', `/city/${cityId}`);
                  }}
                  className="text-xs text-gray-500 hover:text-[#F97316]"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Category</p>
                  <div className="space-y-1 max-h-52 overflow-auto pr-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() =>
                          router.push(`${ROUTES.CATEGORY}/${cat.id}${cityQuery}`)
                        }
                        className={cn(
                          'w-full rounded-lg px-2 py-1.5 text-left text-xs transition',
                          'hover:bg-gray-50 text-gray-600'
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Price range</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#F97316]"
                    />
                    <input
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#F97316]"
                    />
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">City</p>
                  <select
                    value={selectedCityId}
                    onChange={(e) => {
                      const value = e.target.value ? Number(e.target.value) : cityId;
                      handleCityChange(value);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#F97316]"
                  >
                    {cities.map((city) => (
                      <option key={city.cityId} value={city.cityId}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sidebar Ads */}
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs font-semibold text-gray-700">Ads</p>
                <div className="mt-2 flex h-64 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-center text-xs text-gray-500 px-3">
                  Google Ads Space
                </div>
              </div>
            </div>
          </aside>

          {/* Products */}
          <section className="lg:col-span-9">
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3 md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    "{currentCityName}"
                  </h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredProducts.length} of {totalCount} results
                  </p>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2">
                  <button
                    onClick={() => setIsMobileFiltersOpen((v) => !v)}
                    className="lg:hidden rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 inline-flex items-center gap-2"
                  >
                    {isMobileFiltersOpen ? (
                      <>
                        <FiX className="w-4 h-4" />
                        Close
                      </>
                    ) : (
                      <>Filters</>
                    )}
                  </button>

                  <div className="relative flex-1 md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search in this city..."
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-[#F97316]"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput('');
                          setSearchQuery('');
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                      >
                        <FiX />
                      </button>
                    )}
                  </div>

                  <button
                    onClick={handleSearch}
                    className="rounded-lg bg-[#F97316] px-4 py-2 text-sm font-semibold text-white hover:bg-[#e56912]"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-[280px] rounded-xl bg-gray-200 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl bg-white border border-gray-200 py-14 text-center">
                <p className="text-xl font-bold text-gray-700">No products found</p>
                <p className="text-sm text-gray-500 mt-1">
                  Try changing filters or search keyword
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filteredProducts.map((product, idx) => {
                    const isFav = localFavs.has(product.ProductId);
                    const isFavLoading = favLoading === product.ProductId;

                    return (
                      <motion.div
                        key={product.ProductId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.02 }}
                      >
                        <Link href={`/product/${product.ProductId}`}>
                          <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
                            <div className="relative h-48 w-full bg-gray-200">
                              <div className="absolute left-2 top-2 z-10 flex flex-col gap-1">
                                {product.IsFeatured && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
                                    <FiStar className="h-3 w-3" />
                                    Featured
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
                                className="absolute right-2 top-2 z-10 rounded-full bg-white/90 p-2"
                              >
                                {isFavLoading ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-[#F97316]" />
                                ) : isFav ? (
                                  <FaHeart className="h-4 w-4 text-[#F97316]" />
                                ) : (
                                  <FiHeart className="h-4 w-4 text-gray-500" />
                                )}
                              </button>

                              <Image
                                src={getCityProductImage(product.MainPicPath)}
                                alt={product.ProdcutTitle}
                                fill
                                className="object-cover"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    'https://via.placeholder.com/300x200?text=No+Image';
                                }}
                              />
                            </div>

                            <div className="p-3">
                              <p className="text-xl font-bold text-[#F97316]">
                                {formatCurrency(product.Price, 'PKR')}
                              </p>
                              <h3 className="line-clamp-1 text-lg font-semibold text-gray-800">
                                {product.ProdcutTitle}
                              </h3>
                              <h3 className="line-clamp-1 mb-3 text-md font-medium text-gray-500">
                                {product.ProductDescription}
                              </h3>
                              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <FiMapPin className="h-3.5 w-3.5" />
                                  {product.Address}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <FiClock className="h-3.5 w-3.5" />
                                  {product.TimeAgo}
                                </span>
                              </div>
                            </div>
                          </article>
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
          </section>
        </div>
      </Container>
    </main>
  );
}