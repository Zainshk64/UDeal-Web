'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FiSearch, FiSliders, FiX } from 'react-icons/fi';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORIES, ROUTES } from '@/src/utils/constants';
import {
  DEFAULT_FILTERS,
  getBrands,
  getCategories,
  getCities,
  getCitiesByProvince,
  getFilteredSuggestions,
  getMakeCompanies,
  getMakeYears,
  getProductsByIds,
  getProvinces,
  getSubcategories,
  getSuggestions,
  type FilterState,
  type SuggestItem,
} from '@/src/api/services/HomeSearchBarApi';
import { ProductSearchFilters } from '@/src/components/search/ProductSearchFilters';
import { SearchProductCard } from '@/src/components/search/SearchProductCard';
import { Pagination } from '@/src/components/seller/Pagination';
import { getRecentSearches, pushRecentSearch, removeRecentSearch } from '@/src/components/search/searchUtils';

const RECENT_KEY = 'udz_recent_product_searches';
const PAGE_SIZE = 30;

export default function ProductSearchPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get('q') || '';
  const [input, setInput] = useState(initialQ);
  const [selectedQuery, setSelectedQuery] = useState(initialQ);
  const [recent, setRecent] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestionPage, setSuggestionPage] = useState(1);
  const [suggestions, setSuggestions] = useState<SuggestItem[]>([]);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [resultPage, setResultPage] = useState(1);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => setRecent(getRecentSearches(RECENT_KEY)), []);

  useEffect(() => {
    setSuggestionPage(1);
    setSuggestions([]);
  }, [input]);

  const suggestionsQuery = useQuery({
    queryKey: ['search-suggest', input, suggestionPage],
    queryFn: () => getSuggestions(input.trim(), suggestionPage, PAGE_SIZE),
    enabled: input.trim().length >= 2,
  });

  useEffect(() => {
    if (!suggestionsQuery.data) return;
    setSuggestions((prev) =>
      suggestionPage === 1 ? suggestionsQuery.data : [...prev, ...suggestionsQuery.data],
    );
  }, [suggestionsQuery.data, suggestionPage]);

  const categoriesQuery = useQuery({ queryKey: ['search-categories'], queryFn: getCategories });
  const provincesQuery = useQuery({ queryKey: ['search-provinces'], queryFn: getProvinces });
  const yearsQuery = useQuery({ queryKey: ['search-years'], queryFn: getMakeYears });
  const subcategoriesQuery = useQuery({
    queryKey: ['search-subcategories', filters.catId],
    queryFn: () => getSubcategories(filters.catId as number),
    enabled: Boolean(filters.catId),
  });
  const companiesQuery = useQuery({
    queryKey: ['search-companies', filters.catId],
    queryFn: () => getMakeCompanies(filters.catId as number),
    enabled: Boolean(filters.catId),
  });
  const brandsQuery = useQuery({
    queryKey: ['search-brands', filters.makeId],
    queryFn: () => getBrands(filters.makeId as number),
    enabled: Boolean(filters.makeId),
  });
  const citiesQuery = useQuery({
    queryKey: ['search-cities', filters.provinceId],
    queryFn: () => (filters.provinceId ? getCitiesByProvince(filters.provinceId) : getCities()),
  });

  const filteredHitQuery = useQuery({
    queryKey: ['search-filtered-hits', selectedQuery, filters, resultPage],
    queryFn: () => getFilteredSuggestions(selectedQuery.trim(), filters, resultPage, PAGE_SIZE),
    enabled: selectedQuery.trim().length >= 2,
  });

  const productIds = useMemo(
    () => (filteredHitQuery.data?.hits || []).map((x) => x.productId),
    [filteredHitQuery.data?.hits],
  );
  const productsQuery = useQuery({
    queryKey: ['search-products-by-ids', productIds],
    queryFn: () => getProductsByIds(productIds),
    enabled: productIds.length > 0,
  });

  const isSearching = filteredHitQuery.isFetching || productsQuery.isFetching;
  const totalHits = filteredHitQuery.data?.totalHits || 0;
  const totalPages = Math.max(1, Math.ceil(totalHits / PAGE_SIZE));

  const submitQuery = (q: string) => {
    const clean = q.trim();
    if (clean.length < 2) return;
    setSelectedQuery(clean);
    setInput(clean);
    setRecent(pushRecentSearch(RECENT_KEY, clean));
    setShowDropdown(false);
    setResultPage(1);
    router.replace(`${ROUTES.SEARCH}?q=${encodeURIComponent(clean)}`, { scroll: false });
  };

  const clearSearch = () => {
    setInput('');
    setSelectedQuery('');
    setSuggestions([]);
    setResultPage(1);
    setFilters(DEFAULT_FILTERS);
    router.replace(ROUTES.SEARCH, { scroll: false });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-7xl px-3 pb-8 sm:px-4">
        <div className="rounded-2xl border border-white/50 bg-white/80 p-3 shadow-sm backdrop-blur md:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              onKeyDown={(e) => e.key === 'Enter' && submitQuery(input)}
              placeholder="Search products..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-20 text-sm outline-none focus:border-[#F97316]"
            />
            {!!input && (
              <button
                className="absolute right-14 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setInput('')}
              >
                <FiX />
              </button>
            )}
            <button
              onClick={() => submitQuery(input)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-[#F97316] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Search
            </button>
          </div>

          <AnimatePresence>
            {showDropdown && input.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              >
                {suggestions.length === 0 && !suggestionsQuery.isFetching ? (
                  <p className="px-2 py-4 text-sm text-gray-500">No suggestions</p>
                ) : (
                  <>
                    {suggestions.map((s) => (
                      <button
                        key={`${s.productId}-${s.productTitle}`}
                        className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => submitQuery(s.productTitle)}
                      >
                        <FiSearch className="mr-2 h-4 w-4 text-gray-400" />
                        <span className="line-clamp-1">{s.productTitle}</span>
                      </button>
                    ))}
                    {suggestionsQuery.data && suggestionsQuery.data.length >= PAGE_SIZE && (
                      <button
                        className="mt-1 w-full rounded-lg border border-gray-200 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                        onClick={() => setSuggestionPage((p) => p + 1)}
                      >
                        Load more
                      </button>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {recent.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs">
                <button className="max-w-[180px] truncate" onClick={() => submitQuery(item)}>
                  {item}
                </button>
                <button
                  className="text-gray-500 hover:text-red-500"
                  onClick={() => setRecent(removeRecentSearch(RECENT_KEY, item))}
                >
                  <FiX className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>

          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => router.push(`${ROUTES.CATEGORY}/${cat.id}`)}
                className="shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:border-[#F97316] hover:text-[#F97316]"
              >
                <span className="mr-1">{cat.icon ?? '•'}</span>
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {!!selectedQuery && (
          <div className="mt-3 flex items-center gap-2">
            <span className="rounded-lg bg-orange-50 px-3 py-2 text-sm font-semibold text-[#F97316]">
              Selected: {selectedQuery}
            </span>
            <button className="text-sm text-gray-500 hover:text-red-500" onClick={clearSearch}>
              Clear Search
            </button>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <ProductSearchFilters
            open={mobileFiltersOpen}
            onClose={() => setMobileFiltersOpen(false)}
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setResultPage(1);
            }}
            onClear={() => {
              setFilters(DEFAULT_FILTERS);
              setResultPage(1);
            }}
            categories={categoriesQuery.data || []}
            subcategories={subcategoriesQuery.data || []}
            provinces={provincesQuery.data || []}
            cities={citiesQuery.data || []}
            companies={companiesQuery.data || []}
            brands={brandsQuery.data || []}
            years={yearsQuery.data || []}
          />

          <section className="lg:col-span-9 xl:col-span-7">
            <div className="mb-3 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3">
              <div>
                <h2 className="text-base font-bold text-gray-900">Search Results</h2>
                <p className="text-xs text-gray-500">
                  {selectedQuery ? `Showing ${totalHits} matches` : 'Type at least 2 characters'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold lg:hidden"
              >
                <FiSliders className="h-4 w-4" />
                Filters
              </button>
            </div>

            {!selectedQuery ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                Search products to view results.
              </div>
            ) : isSearching ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[280px] animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : (productsQuery.data || []).length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-base font-semibold text-gray-800">No products found</p>
                <p className="text-sm text-gray-500">Try changing query or filters.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {(productsQuery.data || []).map((p) => (
                    <SearchProductCard key={p.ProductId} product={p} />
                  ))}
                </div>
                <Pagination currentPage={resultPage} totalPages={totalPages} onPageChange={setResultPage} />
              </>
            )}
          </section>

          <aside className="hidden xl:block xl:col-span-2">
            <div className="sticky top-28 rounded-2xl border border-dashed border-gray-300 bg-white p-4 text-xs text-gray-500">
              Reserved for future ads
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

