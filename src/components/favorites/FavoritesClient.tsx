'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiHeart, FiMapPin, FiSearch, FiSliders, FiStar } from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';

import { Container } from '@/src/components/ui/Container';
import { Pagination } from '@/src/components/seller/Pagination';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';
import {
  type FavoriteProduct,
  getFavoriteProducts,
} from '@/src/api/services/favoritesApi';
import { toggleFavorite } from '@/src/api/services/HomeApi';
import { getImageUrl } from '@/src/utils/image';
import { formatCurrency } from '@/src/utils/format';
import { cn } from '@/src/utils/cn';

const PAGE_SIZE = 30;

type SortKey = 'recent' | 'price_asc' | 'price_desc' | 'title';

export default function FavoritesClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();

  const [products, setProducts] = useState<FavoriteProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [silentLoading, setSilentLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sort, setSort] = useState<SortKey>('recent');
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const userId = user?.userId ?? 0;

  const fetchFavorites = useCallback(
    async (page: number, opts?: { silent?: boolean }) => {
      if (!userId) return;
      const silent = opts?.silent === true;
      if (silent) setSilentLoading(true);
      else setLoading(true);
      try {
        const res = await getFavoriteProducts(userId, page, PAGE_SIZE);
        setProducts(res.products || []);
        const meta = res.meta?.[0];
        setTotalCount(meta?.TotalCount ?? 0);
      } finally {
        setLoading(false);
        setSilentLoading(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (userId) fetchFavorites(currentPage);
  }, [authLoading, isAuthenticated, userId, currentPage, fetchFavorites, router]);

  useEffect(() => {
    if (loading || silentLoading) return;
    if (products.length === 0 && totalCount > 0 && currentPage > 1) {
      setCurrentPage((p) => Math.max(1, p - 1));
    }
  }, [products.length, totalCount, currentPage, loading, silentLoading]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const filteredSorted = useMemo(() => {
    let list = [...products];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.ProdcutTitle.toLowerCase().includes(q) ||
          (p.ProductDescription || '').toLowerCase().includes(q) ||
          (p.Address || '').toLowerCase().includes(q)
      );
    }

    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((p) => p.Price >= min);
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((p) => p.Price <= max);
    }

    if (featuredOnly) {
      list = list.filter((p) => p.IsFeatured);
    }

    switch (sort) {
      case 'price_asc':
        list.sort((a, b) => a.Price - b.Price);
        break;
      case 'price_desc':
        list.sort((a, b) => b.Price - a.Price);
        break;
      case 'title':
        list.sort((a, b) => a.ProdcutTitle.localeCompare(b.ProdcutTitle));
        break;
      default:
        break;
    }

    return list;
  }, [products, searchQuery, minPrice, maxPrice, featuredOnly, sort]);

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
    setMobileFiltersOpen(false);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUnfavorite = async (productId: number) => {
    if (!userId) return;
    setFavLoading(productId);
    try {
      const result = await toggleFavorite(productId, userId);
      if (result.success) {
        await fetchFavorites(currentPage, { silent: true });
      }
    } finally {
      setFavLoading(null);
    }
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setFeaturedOnly(false);
    setSort('recent');
  };

  if (authLoading) {
    return (
      <div className="min-h-[60vh] bg-gray-50">
        <Container className="py-24">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filterBar = (
    <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end">
        <div className="min-w-0 flex-1">
          <label className="mb-1 block text-xs font-medium text-gray-600">Search</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Title, description, city…"
                className="w-full rounded-xl border border-gray-200 py-2.5 pl-10 pr-3 text-sm focus:border-[#F97316] focus:outline-none focus:ring-2 focus:ring-[#F97316]/20"
              />
            </div>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded-xl bg-[#003049] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004d6d]"
            >
              Apply
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen((o) => !o)}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 md:hidden"
        >
          <FiSliders className="h-4 w-4" />
          Filters
        </button>
      </div>

      <div
        className={cn(
          'grid gap-4 md:grid-cols-2 lg:grid-cols-4',
          mobileFiltersOpen ? 'grid' : 'hidden md:grid'
        )}
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Min price (PKR)</label>
          <input
            type="number"
            inputMode="numeric"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="0"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Max price (PKR)</label>
          <input
            type="number"
            inputMode="numeric"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            placeholder="Any"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="recent">Recent (default)</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="title">Title A–Z</option>
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5">
            <input
              type="checkbox"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
              className="rounded border-gray-300 text-[#F97316] focus:ring-[#F97316]"
            />
            <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
              <FiStar className="h-4 w-4 text-amber-500" />
              Featured only
            </span>
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span>
          {totalCount} saved {totalCount === 1 ? 'item' : 'items'}
          {silentLoading ? ' · Updating…' : ''}
        </span>
        <button
          type="button"
          onClick={clearFilters}
          className="font-medium text-[#003049] hover:underline"
        >
          Clear filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="relative pt-24  overflow-hidden bg-gradient-to-br from-[#003049] via-[#004d6d] to-[#003049]">
        <div className="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.08\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]" />
        <Container className="relative py-14 sm:py-20">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              <FiHeart className="h-4 w-4 text-rose-300" />
              Saved listings
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl">Your favorites</h1>
            <p className="mt-2 text-white/80">
              Quick access to ads you care about. Filter, sort, or remove items anytime.
            </p>
          </motion.div>
        </Container>
      </section>

      <Container className="py-12">
        {filterBar}

        {loading ? (
          <div className="mt-10 flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center"
          >
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
              <FiHeart className="h-8 w-8 text-rose-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
            <p className="mx-auto mt-2 max-w-md text-gray-600">
              Tap the heart on any listing to save it here. Browse categories to discover deals.
            </p>
            <Link
              href={ROUTES.HOME}
              className="mt-6 inline-flex rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-white shadow-md transition hover:bg-[#ea580c]"
            >
              Explore marketplace
            </Link>
          </motion.div>
        ) : filteredSorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-10 rounded-2xl border border-amber-200 bg-amber-50/80 px-6 py-12 text-center"
          >
            <p className="font-medium text-amber-900">No items match your filters</p>
            <p className="mt-1 text-sm text-amber-800">
              Try adjusting search or price range, or clear filters to see everything on this page.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-4 inline-flex rounded-xl border border-amber-300 bg-white px-5 py-2.5 text-sm font-semibold text-amber-900 hover:bg-amber-100"
            >
              Clear filters
            </button>
          </motion.div>
        ) : (
          <>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredSorted.map((product, index) => {
                const thumb = product.MainPicThumbnail || product.MainPicPath;
                const img =
                  getImageUrl(thumb) ||
                  'https://via.placeholder.com/400x300?text=No+Image';
                const busy = favLoading === product.ProductId;

                return (
                  <motion.li
                    key={product.ProductId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
                  >
                    <Link
                      href={`${ROUTES.PRODUCT_DETAIL}/${product.ProductId}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                        <Image
                          src={img}
                          alt=""
                          fill
                          className="object-cover transition group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, 25vw"
                          unoptimized
                        />
                        {product.IsFeatured && (
                          <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500/95 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                            <FiStar className="h-3 w-3" />
                            Featured
                          </span>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="line-clamp-2 min-h-[2.5rem] font-semibold text-gray-900">
                          {product.ProdcutTitle}
                        </p>
                        <p className="mt-1 text-lg font-bold text-[#003049]">
                          {formatCurrency(product.Price)}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{product.Address}</span>
                        </div>
                        <p className="mt-1 text-xs text-gray-400">{product.TimeAgo}</p>
                      </div>
                    </Link>
                    <button
                      type="button"
                      disabled={busy}
                      onClick={(e) => {
                        e.preventDefault();
                        void handleUnfavorite(product.ProductId);
                      }}
                      className="absolute right-1 top-1 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-rose-600 shadow-md backdrop-blur transition hover:bg-rose-50 disabled:opacity-50"
                      title="Remove from favorites"
                    >
                      {busy ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
                      ) : (
                        <FaHeart className="h-5 w-5" />
                      )}
                    </button>
                  </motion.li>
                );
              })}
            </ul>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Container>
    </div>
  );
}
