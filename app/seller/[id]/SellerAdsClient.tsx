'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

import { Navbar } from '@/src/components/layout/Navbar';
import { Container } from '@/src/components/ui/Container';
import { SellerHeader } from '@/src/components/seller/SellerHeader';
import { SellerProductCard } from '@/src/components/seller/SellerProductCard';
import { SellerAdSkeleton } from '@/src/components/seller/SellerAdSkeleton';
import { Pagination } from '@/src/components/seller/Pagination';
import { Footer } from '@/src/components/layout/Footer';

import {
  getProductsByUser,
  SellerProduct,
} from '@/src/api/services/SellerApi';

const ITEMS_PER_PAGE = 9;

export default function SellerAdsClient() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sellerId = params?.id ? Number(params.id) : 0;

  const sellerName = searchParams.get('name') || 'Seller';
  const sellerPic = searchParams.get('pic') || '';
  const sellerPhone = searchParams.get('phone') || '';
  const joinedDate = searchParams.get('joined') || '';
  const totalAds = Number(searchParams.get('totalAds') || 0);

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchProducts = useCallback(async () => {
    if (!sellerId) return;
    setLoading(true);
    const data = await getProductsByUser(sellerId);
    setProducts(data);
    setLoading(false);
  }, [sellerId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <>
      <Navbar variant="solid" showSearch={false} />

      <main className="pt-24 pb-8 min-h-screen bg-gray-50">
        <Container className="py-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-[#003049] transition-colors group"
          >
            <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Back</span>
          </button>
        </Container>

        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28">
                <SellerHeader
                  name={sellerName}
                  pic={sellerPic}
                  phone={sellerPhone}
                  joinedDate={joinedDate}
                  totalAds={totalAds}
                />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl p-4 mb-6 border border-gray-100 flex items-center justify-between">
                <h3 className="text-base font-semibold text-gray-700">
                  {loading
                    ? 'Loading ads...'
                    : `${products.length} Active Ad${products.length !== 1 ? 's' : ''}`}
                </h3>
                <button
                  onClick={fetchProducts}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <FiRefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <SellerAdSkeleton key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
                    <span className="text-5xl">📦</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">No Ads Found</h3>
                  <p className="text-gray-500 text-center">
                    This seller hasn&apos;t posted any ads yet.
                  </p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedProducts.map((product, idx) => (
                      <motion.div
                        key={product.productId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <SellerProductCard product={product} />
                      </motion.div>
                    ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          </div>
        </Container>
      </main>

      <Footer />
    </>
  );
}
