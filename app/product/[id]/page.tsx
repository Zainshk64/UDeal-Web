'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiShare2,
  FiHeart,
  FiFileText,
} from 'react-icons/fi';
import { FaHeart } from 'react-icons/fa';
import { toast } from 'sonner';

import { Navbar } from '@/src/components/layout/Navbar';
import { Container } from '@/src/components/ui/Container';
import { ImageGallery } from '@/src/components/product/ImageGallery';
import { ProductInfo } from '@/src/components/product/ProductInfo';
import { ProductDetailsSection } from '@/src/components/product/ProductDetails';
import { SellerCard } from '@/src/components/product/SellerCard';
import { SafetyTips } from '@/src/components/product/SafetyTips';
import { ReportAdModal } from '@/src/components/product/ReportAdModal';
import { ProductDetailSkeleton } from '@/src/components/product/ProductDetailSkeleton';
import { Footer } from '@/src/components/layout/Footer';

import {
  getProductById,
  ProductDetailResponse,
  ProductDetail,
  ProductPicture,
  ProductMetaData,
} from '@/src/api/services/HomeApi';
import { reportAd } from '@/src/api/services/SellerApi';
import { useAuth } from '@/src/context/AuthContext';
import { useFavorite } from '@/hooks/useFavorite';
import { useProductSession } from '@/hooks/useProductSession';
import { cn } from '@/src/utils/cn';
import { ImageViewer } from '@/src/components/product/ImagePreview';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const productId = params?.id ? Number(params.id) : undefined;

  // Track session
  useProductSession(productId);

  // State
  const [data, setData] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [localFavorite, setLocalFavorite] = useState<boolean | null>(
    null
  );
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [viewerInitialIndex, setViewerInitialIndex] = useState(0);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);

  const { loadingFavId, handleFavoriteToggle } = useFavorite();

  // Fetch product data
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      const response = await getProductById(
        productId,
        true, // isGeneral = true for view count
        user?.userId || 0
      );
      setData(response);

      if (response?.Details?.[0]) {
        setLocalFavorite(
          response.Details[0].IsFavorite === true
        );
      }

      setLoading(false);
    };

    fetchProduct();
  }, [productId, user?.userId]);

  // Handlers
  const handleShare = async () => {
    const detail = data?.Details?.[0];
    if (!detail) return;

    const shareUrl = `${window.location.origin}/product/${detail.ProductId}`;
    const shareText = `Check out ${detail.ProdcutTitle} for PKR ${detail.Price?.toLocaleString()} on UDealZone!\n\n${shareUrl}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: detail.ProdcutTitle,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link Copied', {
          description: 'Product link copied to clipboard',
        });
      }
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const onFavoritePress = async () => {
    if (!data?.Details?.[0]) return;

    const detail = data.Details[0];
    const currentFavStatus =
      localFavorite ?? detail.IsFavorite === true;

    await handleFavoriteToggle(
      detail.ProductId,
      currentFavStatus,
      () => {
        setLocalFavorite((prev) => !prev);
      }
    );
  };

  const handleReportAd = async (
    keyword: string,
    comment: string
  ) => {
    if (!isAuthenticated || !user?.userId) {
      toast.info('Login Required', {
        description: 'Please login to report this ad',
      });
      setReportModalVisible(false);
      return;
    }

    setReportLoading(true);

    const res = await reportAd({
      productId: data!.Details[0].ProductId,
      complainantId: user.userId,
      keyword,
      comment,
    });

    setReportLoading(false);
    setReportModalVisible(false);

    toast[res.success ? 'success' : 'error'](
      res.success ? 'Report Submitted' : 'Report Failed',
      { description: res.message }
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Navbar variant="solid" showSearch={false} />
        <div className="pt-24">
          <ProductDetailSkeleton />
        </div>
      </>
    );
  }

  // Error / Not found state
  if (!data || !data.Details?.[0]) {
    return (
      <>
        <Navbar variant="solid" showSearch={false} />
        <div className="pt-24 min-h-screen flex items-center justify-center">
          <div className="text-center px-6">
            <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <span className="text-5xl">😕</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-700 mb-2">
              Product Not Found
            </h2>
            <p className="text-gray-500 mb-8">
              This ad may have been removed or is no longer available.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#F97316] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#ea580c] transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </>
    );
  }

  // Main render
  const detail: ProductDetail = data.Details[0];
  const pictures: ProductPicture[] = data.Pictures || [];
  const metaData: ProductMetaData = data.MetaData?.[0] || ({} as ProductMetaData);
  const isFavorited = localFavorite ?? detail.IsFavorite === true;
  const isLoadingFav = loadingFavId === detail.ProductId;

  return (
    <>
      <Navbar variant="solid" showSearch={false} />

      <main className="pt-24 pb-20 lg:pb-8 min-h-screen bg-gray-50">
        {/* Breadcrumb / Back */}
        <Container className="py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-[#003049] transition-colors group"
            >
              <FiArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span className="font-medium">Back</span>
            </button>

            <div className="flex items-center gap-2">
              {/* Share */}
              <button
                onClick={handleShare}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#F97316] hover:text-[#F97316] transition-all"
                title="Share"
              >
                <FiShare2 className="w-5 h-5" />
              </button>

              {/* Favorite */}
              <button
                onClick={onFavoritePress}
                disabled={isLoadingFav}
                className="p-2.5 bg-white border border-gray-200 rounded-xl hover:border-[#F97316] transition-all disabled:opacity-50"
                title="Favorite"
              >
                {isLoadingFav ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-[#F97316] rounded-full animate-spin" />
                ) : isFavorited ? (
                  <FaHeart className="w-5 h-5 text-[#F97316]" />
                ) : (
                  <FiHeart className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </Container>

        {/* Content */}
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT COLUMN: Images + Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <ImageGallery
                  pictures={pictures}
                  onOpenViewer={(index) => {
                    setViewerInitialIndex(index);
                    setImageViewerVisible(true);
                  }}
                />
              </motion.div>

              {/* Product Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm"
              >
                <ProductInfo detail={detail} />
              </motion.div>

              {/* Product Details Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm"
              >
                <ProductDetailsSection detail={detail} />
              </motion.div>

              {/* Description */}
              {detail.ProductDescription && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
                      <FiFileText className="w-5 h-5 text-purple-500" />
                    </div>
                    <h3 className="text-lg font-bold text-[#003049]">
                      Description
                    </h3>
                  </div>
                  <div className="bg-gray-50 rounded-2xl p-4">
                    <p className="text-gray-700 leading-7 text-[15px] whitespace-pre-wrap">
                      {detail.ProductDescription}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Safety Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <SafetyTips />
              </motion.div>
            </div>

            {/* RIGHT COLUMN: Seller Info (Sticky) */}
            <div className="lg:col-span-1">
              <div className="lg:sticky lg:top-28 space-y-6">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <SellerCard
                    metaData={metaData}
                    detail={detail}
                    onReport={() => setReportModalVisible(true)}
                  />
                </motion.div>
              </div>
            </div>
          </div>
        </Container>

    
      </main>


      {/* Image Viewer Modal */}
      <ImageViewer
        visible={imageViewerVisible}
        images={pictures}
        initialIndex={viewerInitialIndex}
        onClose={() => setImageViewerVisible(false)}
      />

      {/* Report Modal */}
      <ReportAdModal
        visible={reportModalVisible}
        onClose={() => setReportModalVisible(false)}
        onSubmit={handleReportAd}
        isLoading={reportLoading}
      />
    </>
  );
}