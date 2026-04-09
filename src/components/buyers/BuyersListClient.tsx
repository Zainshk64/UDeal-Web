'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiSearch, FiShoppingBag, FiUser, FiX, FiMapPin, FiClock } from 'react-icons/fi';

import { Container } from '@/src/components/ui/Container';
import { Pagination } from '@/src/components/seller/Pagination';
import { CATEGORIES, ROUTES } from '@/src/utils/constants';
import { cn } from '@/src/utils/cn';
import {
  getBuyerCards,
  getAllCitiesForBuyers,
  formatPriceRange,
  parseBuyerPriceRangeBounds,
  type BuyerCard,
  type BuyerCity,
} from '@/src/api/services/buyerApi';
import AppAdBanner from '@/src/components/ads/AppAdBanner';
import GoogleAdSlot from '@/src/components/ads/GoogleAdSlot';
import { usePageAds } from '@/src/hooks/usePageAds';

const PAGE_SIZE = 30;

type SortKey = 'recent' | 'title' | 'price_asc' | 'price_desc';

export default function BuyersListClient() {
  const { ads } = usePageAds('All Listings Page');
  const [cards, setCards] = useState<BuyerCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [catId, setCatId] = useState<number | null>(null);
  const [cities, setCities] = useState<BuyerCity[]>([]);
  const [cityId, setCityId] = useState<number | ''>('');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState<SortKey>('recent');
  const [mobileFilters, setMobileFilters] = useState(false);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const load = useCallback(async () => {
    setLoading(true);
    const res = await getBuyerCards({
      catId: catId ?? undefined,
      cityId: typeof cityId === 'number' ? cityId : undefined,
      pageNumber: page,
      pageSize: PAGE_SIZE,
    });
    setCards(res.products || []);
    setTotalCount(res.meta?.[0]?.TotalCount ?? 0);
    setLoading(false);
  }, [catId, cityId, page]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    (async () => {
      const c = await getAllCitiesForBuyers();
      setCities(c);
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = [...cards];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.RequiredTitle.toLowerCase().includes(q));
    }
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    if (min !== null && !Number.isNaN(min)) {
      list = list.filter((c) => {
        const b = parseBuyerPriceRangeBounds(c.PriceRange);
        if (!b) return true;
        return b.max >= min;
      });
    }
    if (max !== null && !Number.isNaN(max)) {
      list = list.filter((c) => {
        const b = parseBuyerPriceRangeBounds(c.PriceRange);
        if (!b) return true;
        return b.min <= max;
      });
    }
    if (sort === 'title') {
      list.sort((a, b) => a.RequiredTitle.localeCompare(b.RequiredTitle));
    } else if (sort === 'price_asc' || sort === 'price_desc') {
      list.sort((a, b) => {
        const ba = parseBuyerPriceRangeBounds(a.PriceRange);
        const bb = parseBuyerPriceRangeBounds(b.PriceRange);
        const va = ba?.min ?? 0;
        const vb = bb?.min ?? 0;
        return sort === 'price_asc' ? va - vb : vb - va;
      });
    }
    return list;
  }, [cards, searchQuery, minPrice, maxPrice, sort]);

  const applySearch = () => {
    setSearchQuery(searchInput.trim());
    setPage(1);
    setMobileFilters(false);
  };

  const clearFilters = () => {
    setCatId(null);
    setCityId('');
    setMinPrice('');
    setMaxPrice('');
    setSearchInput('');
    setSearchQuery('');
    setSort('recent');
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="relative overflow-hidden py-16 md:pt-35 pb-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#003049] via-[#00496b] to-[#006d96]" />
        <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[length:24px_24px]" />
        <Container className="relative z-10">
          <nav className="mb-4 flex flex-wrap items-center gap-2 text-sm text-white/60">
            <Link href={ROUTES.HOME} className="hover:text-white/90">
              Home
            </Link>
            <span className="text-white/30">/</span>
            <span className="font-medium text-[#F97316]">Buyer requests</span>
          </nav>
          <div className="flex max-w-2xl items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
              <FiShoppingBag className="h-7 w-7 text-[#F97316]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white md:text-5xl">Explore buyers</h1>
              <p className="mt-2 text-sm text-white/75 md:text-base">
                See what people want to buy. Connect with serious buyers in your categories and cities.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <Container className="mt-4">
        <AppAdBanner ad={ads.top} className="mb-4" />
      </Container>

      <Container className="mt-4 pb-16">
                <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl flex md:flex-row flex-col justify-between items-start border border-orange-100 bg-gradient-to-r from-[#003049] to-[#004d6d] p-6 text-white shadow-lg md:p-8"
        >
          <div>

          <h2 className="text-xl font-bold md:text-2xl">Want to buy something?</h2>
          <p className="mt-2 max-w-xl text-sm text-white/80 md:text-base">
            Post what you need sellers who have matching items can reach you. Manage your requests anytime.
          </p>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href={ROUTES.BUYERS_POST}
              className="inline-flex items-center justify-center rounded-md bg-[#F97316] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#ea580c]"
            >
              Post request
            </Link>
            <Link
              href={ROUTES.BUYERS_MY_REQUESTS}
              className="inline-flex items-center justify-center rounded-md border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-semibold backdrop-blur hover:bg-white/20"
            >
              My requests
            </Link>
          </div>
        </motion.div>
        <div className="mb-6 flex justify-center gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setCatId(null);
              setPage(1);
            }}
            className={cn(
              'whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition',
              catId === null
                ? 'border-[#F97316] bg-[#F97316] text-white'
                : 'border-gray-200 bg-white text-gray-700 hover:border-[#F97316] hover:text-[#F97316]'
            )}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                setCatId(c.id);
                setPage(1);
              }}
              className={cn(
                'whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition',
                catId === c.id
                  ? 'border-[#F97316] bg-[#F97316] text-white'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-[#F97316] hover:text-[#F97316]'
              )}
            >
              {c.name}
            </button>
          ))}
        </div>



        <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
          <aside
            className={cn(
              'lg:col-span-3',
              mobileFilters ? 'block' : 'hidden',
              'lg:block'
            )}
          >
            <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-4">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs text-gray-500 hover:text-[#F97316]"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">City</p>
                  <select
                    value={cityId === '' ? '' : String(cityId)}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCityId(v ? Number(v) : '');
                      setPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#F97316]"
                  >
                    <option value="">All cities</option>
                    {cities.map((c) => (
                      <option key={c.cityId} value={c.cityId}>
                        {c.cityName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Price range (PKR)</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder="Min"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
                    />
                    <input
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder="Max"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Sort</p>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs"
                  >
                    <option value="recent">Recent</option>
                    <option value="title">Title A–Z</option>
                    <option value="price_asc">Price: low → high</option>
                    <option value="price_desc">Price: high → low</option>
                  </select>
                </div>
              </div>
              <GoogleAdSlot
                slot="buyer"
                className="mt-6"
                format="rectangle"
                responsive={false}
              />
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3 md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">Buyer listings</h2>
                  <p className="text-xs text-gray-500">
                    Showing {filtered.length} on this page · {totalCount} total
                  </p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 md:w-auto">
                  <button
                    type="button"
                    onClick={() => setMobileFilters((v) => !v)}
                    className="inline-flex rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 lg:hidden"
                  >
                    {mobileFilters ? 'Close' : 'Filters'}
                  </button>
                  <div className="relative min-w-0 flex-1 md:w-72">
                    <FiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && applySearch()}
                      placeholder="Search by title…"
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-[#F97316]"
                    />
                    {searchInput && (
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                        onClick={() => {
                          setSearchInput('');
                          setSearchQuery('');
                        }}
                      >
                        <FiX className="h-4 w-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={applySearch}
                    className="rounded-lg bg-[#003049] px-4 py-2 text-sm font-semibold text-white"
                  >
                    Search
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-48 animate-pulse rounded-2xl border border-gray-200 bg-gray-100"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
                <FiUser className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 font-semibold text-gray-800">No buyer requests found</p>
                <p className="mt-1 text-sm text-gray-500">Try another category, city, or clear filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 text-sm font-semibold text-[#003049] hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <>
                <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((c, i) => (
                    <React.Fragment key={c.ProductReqId}>
                      <motion.li
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.02 }}
                        className="flex flex-col rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md"
                      >
                        <h3 className="line-clamp-2 min-h-[2.75rem] font-semibold text-gray-900">
                          {c.RequiredTitle}
                        </h3>
                        <p className="mt-2 text-sm font-medium text-[#003049]">
                          {formatPriceRange(c.PriceRange)}
                        </p>
                        <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                          <FiMapPin className="h-3.5 w-3.5 shrink-0" />
                          <span className="line-clamp-1">{c.Address}</span>
                        </div>
                        <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <FiClock className="h-3.5 w-3.5" />
                          {c.TimeAgo}
                        </div>
                        <p className="mt-2 text-xs text-gray-500">By {c.BuyerName}</p>
                        <Link
                          href={`${ROUTES.BUYERS}/${c.ProductReqId}`}
                          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[#F97316] py-2.5 text-sm font-semibold text-white hover:bg-[#ea580c]"
                        >
                          View details
                        </Link>
                      </motion.li>
                      {(i + 1) % 9 === 0 && ads.center ? (
                        <li className="md:col-span-2 xl:col-span-3">
                          <AppAdBanner ad={ads.center} />
                        </li>
                      ) : null}
                    </React.Fragment>
                  ))}
                </ul>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </section>
        </div>
        <AppAdBanner ad={ads.bottom} className="mt-6" />
      </Container>
    </main>
  );
}
