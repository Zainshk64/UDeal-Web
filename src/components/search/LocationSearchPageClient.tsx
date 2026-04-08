'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { FiMapPin, FiSearch, FiX } from 'react-icons/fi';
import { CATEGORIES } from '@/src/utils/constants';
import {
  getAllCities,
  getCategoryProductsByLocation,
  getProductsByLocation,
  searchAddress,
  selectAddress,
  type AutocompleteResult,
} from '@/src/api/services/AddressSearchApi';
import { getHomeData, type HomeAd } from '@/src/api/services/HomeApi';
import { SearchProductCard } from '@/src/components/search/SearchProductCard';
import { Pagination } from '@/src/components/seller/Pagination';
import { getRecentSearches, pushRecentSearch, removeRecentSearch } from '@/src/components/search/searchUtils';
import { useAuth } from '@/src/context/AuthContext';

const PAGE_SIZE = 30;
const RECENT_KEY = 'udz_recent_location_searches';

function flattenHomeProducts(data: Awaited<ReturnType<typeof getHomeData>>): HomeAd[] {
  if (!data) return [];
  return [
    ...data.vehicles,
    ...data.bikes,
    ...data.propertysale,
    ...data.propertyrent,
    ...data.mobiles,
    ...data.electronics,
    ...data.furniture,
    ...data.animals,
    ...data.fashion,
    ...data.services,
  ];
}

export default function LocationSearchPageClient() {
  const { user } = useAuth();
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<AutocompleteResult | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedCityName, setSelectedCityName] = useState<string | null>(null);

  useEffect(() => setRecent(getRecentSearches(RECENT_KEY)), []);

  const addressQuery = useQuery({
    queryKey: ['address-autocomplete', input],
    queryFn: () => searchAddress(input.trim()),
    enabled: input.trim().length >= 3,
  });

  const citiesQuery = useQuery({ queryKey: ['all-cities-search'], queryFn: getAllCities });
  const homeQuery = useQuery({ queryKey: ['location-default-home'], queryFn: getHomeData });

  const locationProductsQuery = useQuery({
    queryKey: ['location-products', selectedAddress?.lat, selectedAddress?.lng, selectedCatId, page, user?.userId],
    queryFn: async () => {
      if (!selectedAddress?.lat || !selectedAddress?.lng) return null;
      if (selectedCatId) {
        return getCategoryProductsByLocation({
          catId: selectedCatId,
          longitude: selectedAddress.lng ?? 0,
          latitude: selectedAddress.lat ?? 0,
          pageNumber: page,
          pageSize: PAGE_SIZE,
          userId: user?.userId,
        });
      }
      return getProductsByLocation({
        longitude: selectedAddress.lng ?? 0,
        latitude: selectedAddress.lat ?? 0,
        pageNumber: page,
        pageSize: PAGE_SIZE,
        userId: user?.userId,
      });
    },
    enabled: Boolean(selectedAddress?.lat && selectedAddress?.lng),
  });

  const defaultProducts = useMemo(() => flattenHomeProducts(homeQuery.data), [homeQuery.data]);
  const defaultTotal = defaultProducts.length;
  const defaultSlice = defaultProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const resultProducts = selectedAddress ? locationProductsQuery.data?.products || [] : defaultSlice;
  const totalCount = selectedAddress
    ? locationProductsQuery.data?.meta?.[0]?.TotalCount || 0
    : defaultTotal;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const loading = selectedAddress ? locationProductsQuery.isFetching : homeQuery.isFetching;

  const selectAddressItem = async (item: AutocompleteResult) => {
    const selected = await selectAddress(item.placeId);
    if (!selected) return;
    const full: AutocompleteResult = {
      ...item,
      lat: selected.lat,
      lng: selected.lng,
      displayText: selected.displayText,
      mainText: selected.mainText,
      secondaryText: selected.secondaryText,
      placeId: selected.placeId,
    };
    setSelectedAddress(full);
    setInput(full.displayText);
    setShowDropdown(false);
    setSelectedCityName(null);
    setPage(1);
    setRecent(pushRecentSearch(RECENT_KEY, full.displayText));
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="mx-auto w-full max-w-7xl px-3 pb-8 sm:px-4">
        <div className="rounded-2xl border border-white/50 bg-white/80 p-3 shadow-sm md:p-4">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search location (min 3 chars)..."
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-10 text-sm outline-none focus:border-[#F97316]"
            />
            {!!input && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => {
                  setInput('');
                  setSelectedAddress(null);
                  setSelectedCityName(null);
                  setPage(1);
                }}
              >
                <FiX />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showDropdown && input.trim().length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="mt-2 max-h-72 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
              >
                {(addressQuery.data || []).length === 0 && !addressQuery.isFetching ? (
                  <p className="px-2 py-4 text-sm text-gray-500">No location matches</p>
                ) : (
                  (addressQuery.data || []).map((item) => (
                    <button
                      key={item.placeId}
                      className="flex w-full items-start gap-2 rounded-lg px-3 py-2 text-left hover:bg-gray-50"
                      onClick={() => void selectAddressItem(item)}
                    >
                      <FiMapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-700">{item.displayText}</span>
                    </button>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-3 flex flex-wrap gap-2">
            {recent.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs">
                <button
                  onClick={() => {
                    setInput(item);
                    setShowDropdown(true);
                  }}
                >
                  {item}
                </button>
                <button onClick={() => setRecent(removeRecentSearch(RECENT_KEY, item))}>
                  <FiX className="h-3.5 w-3.5 text-gray-500" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-5 lg:grid-cols-12">
          <aside className="lg:col-span-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <h3 className="mb-2 text-sm font-bold text-gray-900">Cities</h3>
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {(citiesQuery.data || []).map((city) => (
                  <button
                    key={city.cityId}
                    className="w-full rounded-lg px-2 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                    onClick={async () => {
                      setInput(city.cityName);
                      setSelectedCityName(city.cityName);
                      setShowDropdown(false);
                      const list = await searchAddress(city.cityName);
                      if (list.length > 0) {
                        await selectAddressItem(list[0]);
                      }
                    }}
                  >
                    {city.cityName}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <section className="lg:col-span-9">
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3">
              <h2 className="text-base font-bold text-gray-900">Location Results</h2>
              <p className="text-xs text-gray-500">
                {selectedAddress
                  ? `Location: ${selectedAddress.displayText}`
                  : selectedCityName
                    ? `Selected city: ${selectedCityName}`
                    : 'Showing default all products'}
              </p>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                <button
                  className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                    selectedCatId == null
                      ? 'border-[#F97316] bg-[#F97316] text-white'
                      : 'border-gray-200 bg-white text-gray-700'
                  }`}
                  onClick={() => {
                    setSelectedCatId(null);
                    setPage(1);
                  }}
                >
                  All
                </button>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs font-semibold ${
                      selectedCatId === cat.id
                        ? 'border-[#F97316] bg-[#F97316] text-white'
                        : 'border-gray-200 bg-white text-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedCatId(cat.id);
                      setPage(1);
                    }}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-[280px] animate-pulse rounded-xl bg-gray-200" />
                ))}
              </div>
            ) : resultProducts.length === 0 ? (
              <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
                <p className="text-base font-semibold text-gray-800">No products found</p>
                <p className="text-sm text-gray-500">Try another location or category.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {resultProducts.map((p) => (
                    <SearchProductCard key={p.ProductId} product={p} />
                  ))}
                </div>
                <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

