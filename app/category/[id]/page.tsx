"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  FiClock,
  FiHeart,
  FiMapPin,
  FiSearch,
  FiStar,
  FiX,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { toast } from "sonner";

import { Container } from "@/src/components/ui/Container";
import { Pagination } from "@/src/components/seller/Pagination";
import { useAuth } from "@/src/context/AuthContext";
import { CATEGORIES, ROUTES } from "@/src/utils/constants";
import {
  CategoryProduct,
  getCategoryProducts,
} from "@/src/api/services/CategoryApi";
import { CityOption, getAllCities } from "@/src/api/services/CityApi";
import { toggleFavorite } from "@/src/api/services/HomeApi";
import { getImageUrl } from "@/src/utils/image";
import { formatCurrency } from "@/src/utils/format";
import { cn } from "@/src/utils/cn";

const PAGE_SIZE = 30;
export const dynamic = 'force-dynamic';

const HERO_COPY = [
  {
    title: "Find the best {category} deals near you",
    description:
      "Fresh listings daily with trusted sellers, clear pricing, and faster responses.",
  },
  {
    title: "Shop smarter in {category}",
    description:
      "Discover value picks, premium options, and trending products all in one place.",
  },
  {
    title: "{category} that match your style",
    description:
      "Filter by city, budget, and condition to quickly find exactly what you need.",
  },
];

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const catId = params?.id ? Number(params.id) : 0;
  const currentCategory = CATEGORIES.find((c) => c.id === catId);

  const [products, setProducts] = useState<CategoryProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const queryCityIdRaw = searchParams.get("cityId");
  const queryCityId = queryCityIdRaw !== null ? Number(queryCityIdRaw) : null;
  const [selectedCityId, setSelectedCityId] = useState<number | null>(
    queryCityId !== null && !Number.isNaN(queryCityId)
      ? queryCityId
      : user?.cityId || null,
  );
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [cities, setCities] = useState<CityOption[]>([]);
  const [favLoading, setFavLoading] = useState<number | null>(null);
  const [localFavs, setLocalFavs] = useState<Set<number>>(new Set());

  // Sidebar filter states (future-ready)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [condition, setCondition] = useState<"all" | "used" | "new">("all");
  const [radiusKm, setRadiusKm] = useState(35);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const fetchProducts = useCallback(
    async (page: number = 1, city: number | null = selectedCityId) => {
      setLoading(true);
      const res = await getCategoryProducts(
        catId,
        page,
        PAGE_SIZE,
        city,
        user?.userId || null,
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
    [catId, selectedCityId, user?.userId],
  );

  useEffect(() => {
    fetchProducts(1, selectedCityId);
  }, [fetchProducts, catId, selectedCityId]);

  useEffect(() => {
    const loadCities = async () => {
      const data = await getAllCities();
      setCities(data);
    };
    loadCities();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchProducts(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = () => {
    setSearchQuery(searchInput.trim());
  };

  const handleFavorite = async (productId: number) => {
    if (!isAuthenticated || !user?.userId) {
      toast.info("Login Required", {
        description: "Please login to add favorites",
      });
      return;
    }
    setFavLoading(productId);
    try {
      const isFav = localFavs.has(productId);
      const result = await toggleFavorite(productId, user.userId);
      if (result.success) {
        toast.success(
          !isFav ? "Removed from Favorites" : "Added to Favorites",
          {
            // description: result.message,
          },
        );
        setLocalFavs((prev) => {
          const next = new Set(prev);
          if (isFav) next.delete(productId);
          else next.add(productId);
          return next;
        });
      }
    } finally {
      setFavLoading(null);
    }
  };

  const heroContent = useMemo(() => {
    const name = currentCategory?.name || "Category";
    const random = HERO_COPY[Math.floor(Math.random() * HERO_COPY.length)];
    return {
      title: random.title.replace("{category}", name),
      description: random.description,
      image: currentCategory?.banner || "/Category/furniture.png",
    };
  }, [currentCategory?.name, currentCategory?.banner]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = !searchQuery
        ? true
        : product.ProdcutTitle.toLowerCase().includes(
            searchQuery.toLowerCase(),
          );
      const priceOk =
        (!minPrice || product.Price >= Number(minPrice)) &&
        (!maxPrice || product.Price <= Number(maxPrice));
      const conditionOk =
        condition === "all"
          ? true
          : product.Conditon?.toLowerCase() === condition;
      return matchesSearch && priceOk && conditionOk;
    });
  }, [products, searchQuery, minPrice, maxPrice, condition]);

  const cityQuery = selectedCityId !== null ? `?cityId=${selectedCityId}` : "";

  return (
    <div className="">
      {/* Hero Banner */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={heroContent.image}
            alt={currentCategory?.name || "Category"}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#01263A]/85 via-[#01263A]/70 to-[#01263A]/40" />
        </div>

        <Container className="relative z-10 py-14 md:py-20">
          <div className="max-w-2xl text-white">
            <nav className="mb-4 flex items-center gap-2 text-sm text-white/60">
              <Link href="/" className="hover:text-white/90 transition-colors">
                Home
              </Link>
              <span className="text-white/30">/</span>
              <span>Category</span>
              <span className="text-white/30">/</span>
              <span className="text-[#F97316] font-medium">
                {currentCategory?.name}
              </span>
            </nav>

            <h1 className="text-3xl md:text-6xl font-bold leading-tight">
              {heroContent.title}
            </h1>
            <p className="mt-3 text-white/85 text-sm md:text-base">
              {heroContent.description}
            </p>
            {/* <p className="mt-4 text-xs md:text-sm text-white/75">{totalCount} total results available</p> */}
          </div>
        </Container>
      </section>

      <Container className="my-4">
        {/* Category chips */}
        <div className="mb-4 flex gap-2 justify-center overflow-x-auto pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                router.push(`${ROUTES.CATEGORY}/${cat.id}${cityQuery}`)
              }
              className={cn(
                "whitespace-nowrap cursor-pointer rounded-full border px-4 py-2 text-sm font-medium transition",
                cat.id === catId
                  ? "border-[#F97316] bg-[#F97316] text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-[#F97316] hover:text-[#F97316]",
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
              "lg:col-span-3",
              isMobileFiltersOpen ? "block" : "hidden",
              "lg:block",
            )}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 sticky top-28">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-800">Filters</h3>
                <button
                  onClick={() => {
                    setMinPrice("");
                    setMaxPrice("");
                    setCondition("all");
                    setRadiusKm(35);
                    setSearchInput("");
                    setSearchQuery("");
                    setSelectedCityId(null);
                    setIsMobileFiltersOpen(false);
                  }}
                  className="text-xs text-gray-500 hover:text-[#F97316]"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">
                    Category
                  </p>
                  <div className="space-y-1 max-h-52 overflow-auto pr-1">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={`side-${cat.id}`}
                        onClick={() =>
                          router.push(
                            `${ROUTES.CATEGORY}/${cat.id}${cityQuery}`,
                          )
                        }
                        className={cn(
                          "w-full rounded-lg px-2 py-1.5 text-left text-xs transition",
                          cat.id === catId
                            ? "bg-[#F97316]/10 text-[#F97316] font-semibold"
                            : "hover:bg-gray-50 text-gray-600",
                        )}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">
                    Price range
                  </p>
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

                {/* <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">Condition</p>
                  <div className="space-y-2 text-xs text-gray-700">
                    {['all', 'used', 'new'].map((v) => (
                      <label key={v} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="condition"
                          checked={condition === v}
                          onChange={() => setCondition(v as 'all' | 'used' | 'new')}
                        />
                        <span className="capitalize">{v}</span>
                      </label>
                    ))}
                  </div>
                </div> */}

                <div>
                  <p className="mb-2 text-xs font-semibold text-gray-600">
                    City
                  </p>
                  <select
                    value={selectedCityId ?? ""}
                    onChange={(e) => {
                      const value = e.target.value
                        ? Number(e.target.value)
                        : null;
                      setSelectedCityId(value);
                      setCurrentPage(1);
                    }}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#F97316]"
                  >
                    <option value="">All Cities</option>
                    {cities.map((city) => (
                      <option key={city.cityId} value={city.cityId}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* <div>
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-gray-600">Radius</p>
                    <span className="text-xs text-gray-500">{radiusKm} km</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={100}
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(Number(e.target.value))}
                    className="w-full accent-[#F97316]"
                  />
                </div> */}
              </div>
            </div>
          </aside>

          {/* Product section */}
          <section className="lg:col-span-9">
            <div className="mb-3 rounded-xl border border-gray-200 bg-white p-3 md:p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-base font-bold text-gray-800">
                    "{currentCategory?.name || "Category"}"
                  </h2>
                  <p className="text-xs text-gray-500">
                    Showing {filteredProducts.length} of {totalCount} results
                  </p>
                </div>

                <div className="flex w-full md:w-auto items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen((v) => !v)}
                    className="lg:hidden inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    {isMobileFiltersOpen ? (
                      <>
                        <FiX className="h-4 w-4" />
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
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      placeholder="Search in this category..."
                      className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-9 text-sm outline-none focus:border-[#F97316]"
                    />
                    {searchInput && (
                      <button
                        onClick={() => {
                          setSearchInput("");
                          setSearchQuery("");
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
                <p className="text-xl font-bold text-gray-700">
                  No products found
                </p>
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
                                {product.ProductType === "Featured" && (
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
                                className="absolute right-2 cursor-pointer top-2 z-10 rounded-full bg-white/90 p-2"
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
                                src={getImageUrl(product.MainPicPath)}
                                alt={product.ProdcutTitle}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div className="p-3">
                              <p className="text-xl font-bold text-[#F97316]">
                                {formatCurrency(product.Price, "PKR")}
                              </p>
                              <h3 className="line-clamp-1 text-lg font-semibold text-gray-800">
                                {product.ProdcutTitle}
                              </h3>
                              <h3 className="line-clamp-1 mb-3 text-sm mb-3 text-gray-500">
                                {product.ProductDescription}
                              </h3>
                              {/* <p className="mt-1 text-xs text-gray-500">
                                {product.Year || '-'} - {product.Conditon || 'Used'}
                              </p> */}
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
    </div>
  );
}
