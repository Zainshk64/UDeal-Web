'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowUp, FiRefreshCw } from 'react-icons/fi';
import { useHomeData } from '@/hooks/useHomeData';
import { useLocation } from '@/hooks/useLocation';
import { useAuth } from '@/src/context/AuthContext';
import { HeroSection } from './HeroSection';
import { CategoryStrip } from './CategoryStrip';
import { ProductCard } from './ProductCard';
import { ProductGridSkeleton } from '@/src/components/loaders/SkeletonLoader';
import { Footer } from '@/src/components/layout/Footer';
import { Container } from '../ui/Container';
import { CATEGORIES } from '@/src/utils/constants';
import { Button } from '../ui/Button';
import { PopularCities } from './PopularCities';
import { LocationToggle } from './LocationToggle';
import { toast } from 'sonner';
import Link from 'next/link';
import { toggleFavorite } from '@/src/api/services/HomeApi';

export const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { 
    homeData, 
    isLoading, 
    error, 
    dataSource, 
    switchDataSource,
    refetch 
  } = useHomeData();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
const handleToggleFavorite = useCallback(
    async (productId: number, isFavorited: boolean) => {
      if (!isAuthenticated || !user?.userId) {
        toast.info('Login Required', {
          description: 'Please login to add items to favorites',
        });
        return;
      }

      try {
        const result = await toggleFavorite(productId, user.userId);

        if (result.success) {
          toast.success(!isFavorited ? 'Removed from Favorites' : 'Added to Favorites', {
            // description: result.message,
          });
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        toast.error('Error', {
          description: 'Failed to update favorite. Please try again.',
        });
        throw error; // Re-throw so ProductCard can revert the UI state
      }
    },
    [isAuthenticated, user?.userId]
  );
  const categoryKeys = useMemo(() => [
    'vehicles',
    'bikes',
    'propertysale',
    'propertyrent',
    'mobiles',
    'electronics',
    'furniture',
    'animals',
    'fashion',
    'services',
  ] as const, []);

  // Handle location change
  const handleLocationChange = useCallback((coords: { lat: number; lng: number } | null) => {
    setLocationCoords(coords);
    if (coords) {
      switchDataSource('location', coords);
    } else {
      // Switch back to appropriate source
      if (isAuthenticated && user?.cityId) {
        switchDataSource('city');
      } else {
        switchDataSource('default');
      }
    }
  }, [switchDataSource, isAuthenticated, user?.cityId]);

  // Handle city click
  const handleCityClick = useCallback((cityId: number) => {
    // Update user data with selected city
    import('@/src/utils/storage').then(({ updateUserData, getUserData }) => {
      const userData = getUserData();
      if (userData) {
        updateUserData({ cityId });
      }
    });
    
    // Switch to city-based data
    if (user?.userId) {
      switchDataSource('city');
    }
  }, [switchDataSource, user?.userId]);

  // Filter categories that have products
  const categoriesWithProducts = useMemo(() => {
    if (!homeData) return [];
    
    return categoryKeys.filter(key => {
      const products = homeData[key as keyof typeof homeData];
      return Array.isArray(products) && products.length > 0;
    });
  }, [homeData, categoryKeys]);

  return (
    <div className="w-full bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Hero Section */}
      <HeroSection />

      {/* Category Strip (Floating) */}
      <CategoryStrip />

      {/* Main Content */}
      <main>
        {/* Location Toggle */}
        <section className="py-6 mt-10 bg-white border-b border-gray-200 sticky top-20 z-30">
          <Container>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <LocationToggle 
                onLocationChange={handleLocationChange}
                currentCoords={locationCoords}
              />
              
              {dataSource !== 'default' && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<FiRefreshCw className="w-4 h-4" />}
                  onClick={() => {
                    if (dataSource === 'location' && locationCoords) {
                      switchDataSource('location', locationCoords);
                    } else if (dataSource === 'city') {
                      switchDataSource('city');
                    } else {
                      switchDataSource('default');
                    }
                  }}
                  className="text-gray-600 hover:text-[#F97316]"
                >
                  Refresh
                </Button>
              )}
            </div>
          </Container>
        </section>

        {/* Popular Cities */}
        {homeData?.cities && homeData.cities.length > 0 && (
          <PopularCities 
            cities={homeData.cities} 
            // onCityClick={handleCityClick}
          />
        )}

        {/* Products Section */}
        <section className="py-12" id="products">
          <Container>
            {isLoading ? (
              <div className="space-y-12">
                {[1, 2, 3].map((i) => (
                  <div key={i}>
                    <div className="h-10 bg-gray-300 rounded w-64 mb-8 animate-pulse" />
                    <ProductGridSkeleton count={4} />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-20">
                <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button
                    variant="primary"
                    size="md"
                    onClick={refetch}
                    icon={<FiRefreshCw className="w-4 h-4" />}
                  >
                    Retry
                  </Button>
                </div>
              </div>
            ) : homeData ? (
              <div className="space-y-16">
                {categoriesWithProducts.map((key, index) => {
                  const products = homeData[key as keyof typeof homeData] as any[];
                  const category = CATEGORIES.find((c) =>
                    c.name
                      .toLowerCase()
                      .includes(
                        key
                          .replace('propertysale', 'property sale')
                          .replace('propertyrent', 'property rent')
                      )
                  );

                  // Skip if no products
                  if (!products || products.length === 0) return null;

                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                    >
                      {/* Section Header with Gradient Text */}
                      <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-[#003049] to-[#F97316] bg-clip-text text-transparent">
                          {category?.name}
                        </h2>
                        <Link 
                          // href={`${ROUTES.CATEGORY}/${category?.id || ''}`}
                          href={"#"}
                          className="text-[#F97316] font-semibold hover:text-[#d97706] transition-colors flex items-center gap-2 group"
                        >
                          View All
                          <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                      </div>

                      {/* Products Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.slice(0, 4).map((product, idx) => (
                          <motion.div
                            key={product.ProductId}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.05 }}
                          >
                            <ProductCard 
                              product={product} 
                              onFavoriteToggle={handleToggleFavorite}
                              showDistance={dataSource === 'location'}
                            />
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
                
                {categoriesWithProducts.length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 max-w-md mx-auto">
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No Products Found</h3>
                      <p className="text-gray-600 mb-4">
                        {dataSource === 'location' ? 'Try adjusting your location or browse by city.' : 
                         dataSource === 'city' ? 'No products found in your city. Try browsing by location or other cities.' :
                         'No products available at the moment. Please check back later.'}
                      </p>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={refetch}
                      >
                        Refresh
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No data available.</p>
              </div>
            )}
          </Container>
        </section>
      </main>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <motion.button
          onClick={scrollToTop}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-8 right-8 p-4 bg-[#F97316] text-white rounded-full shadow-2xl hover:shadow-xl transition-shadow z-40"
        >
          <FiArrowUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Footer */}
      {/* <Footer /> */}
    </div>
  );
};

export default HomePage;