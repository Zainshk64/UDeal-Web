'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHomeData, getHomeDataByCity, getHomeDataByLocation } from '@/src/api/services/HomeApi';
import { getUserData, isAuthenticated } from '@/src/utils/storage';
import { toast } from 'sonner';

export type HomeDataSource = 'default' | 'city' | 'location';

interface UseHomeDataOptions {
  initialSource?: HomeDataSource;
}

export const useHomeData = ({ initialSource = 'default' }: UseHomeDataOptions = {}) => {
  const [homeData, setHomeData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<HomeDataSource>(initialSource);
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch data based on source
  const fetchData = useCallback(async (source: HomeDataSource, coords?: { lat: number; lng: number }) => {
    setIsLoading(true);
    setError(null);

    try {
      let data = null;
      const userData = getUserData();
      const userId = userData?.userId;

      switch (source) {
        case 'default':
          data = await getHomeData();
          break;
        case 'city':
          if (userData?.cityId && userId) {
            data = await getHomeDataByCity(userData.cityId, userId);
          } else {
            // Fallback to default if no city or user ID
            data = await getHomeData();
            setDataSource('default');
          }
          break;
        case 'location':
          if (coords && userId) {
            data = await getHomeDataByLocation(coords.lng, coords.lat, userId);
          } else if (coords) {
            // If no user ID but have location, still fetch without user context
            data = await getHomeDataByLocation(coords.lng, coords.lat);
          } else {
            // Fallback to default if no coordinates
            data = await getHomeData();
            setDataSource('default');
          }
          break;
      }

      if (data) {
        setHomeData(data);
        // Cache cities if available
        if (data.cities) {
          import('@/src/utils/storage').then(({ setCitiesCache }) => {
            setCitiesCache(data.cities);
          });
        }
      } else {
        throw new Error('No data received');
      }
    } catch (err) {
      console.error('Error fetching home data:', err);
      setError('Failed to load data. Please check your connection and try again.');
      toast.error('Connection Error', {
        description: 'Failed to load products. Please check your internet connection.',
      });
      // Fallback to default data
      const fallbackData = await getHomeData();
      if (fallbackData) {
        setHomeData(fallbackData);
        setDataSource('default');
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      const userData = getUserData();
      const hasAuth = isAuthenticated();
      
      // Determine initial data source
      let initialSourceToUse = initialSource;
      
      if (hasAuth && userData?.cityId) {
        initialSourceToUse = 'city';
      }
      
      await fetchData(initialSourceToUse);
    };

    initializeData();
  }, [fetchData, initialSource]);

  // Switch data source
  const switchDataSource = useCallback(async (newSource: HomeDataSource, coords?: { lat: number; lng: number }) => {
    if (newSource === 'location' && coords) {
      setLocationCoords(coords);
    }
    setDataSource(newSource);
    await fetchData(newSource, coords);
  }, [fetchData]);

  return {
    homeData,
    isLoading,
    error,
    dataSource,
    locationCoords,
    switchDataSource,
    refetch: () => fetchData(dataSource, locationCoords),
  };
};