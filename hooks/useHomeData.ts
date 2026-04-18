'use client';

import { useState, useEffect, useCallback } from 'react';
import { getHomeData, getHomeDataByCity, getHomeDataByLocation } from '@/src/api/services/HomeApi';
import { getUserData, isAuthenticated, getFromStorage } from '@/src/utils/storage';
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
  const [authState, setAuthState] = useState<boolean>(isAuthenticated());

  // Fetch data based on source
  const fetchData = useCallback(async (source: HomeDataSource, coords?: { lat: number; lng: number }) => {
    setIsLoading(true);
    setError(null);

    try {
      let data = null;
      const userData = getUserData();
      const userId = userData?.userId;
      const hasAuth = isAuthenticated();

      // Check if user is actually authenticated
      // Don't use city data if user is not authenticated
      if (source === 'city' && !hasAuth) {
        source = 'default';
        setDataSource('default');
      }

      switch (source) {
        case 'default':
          data = await getHomeData();
          break;
        case 'city':
          // Only use city data if authenticated AND has cityId
          if (hasAuth && userData?.cityId && userId) {
            data = await getHomeDataByCity(userData.cityId, userId);
          } else {
            // Fallback to default if no auth or city
            data = await getHomeData();
            setDataSource('default');
          }
          break;
        case 'location':
          if (coords && userId && hasAuth) {
            data = await getHomeDataByLocation(coords.lng, coords.lat, userId);
          } else if (coords) {
            // If no auth but have location, still fetch without user context
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
      try {
        const fallbackData = await getHomeData();
        if (fallbackData) {
          setHomeData(fallbackData);
          setDataSource('default');
        }
      } catch (fallbackErr) {
        console.error('Fallback fetch failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleStorageChange = () => {
      const hasAuth = isAuthenticated();
      const prevAuthState = authState;

      // If auth state changed
      if (prevAuthState !== hasAuth) {
        setAuthState(hasAuth);

        // If user logged out, reset to default
        if (prevAuthState && !hasAuth) {
          console.log('User logged out - switching to default');
          setDataSource('default');
          setLocationCoords(null);
          fetchData('default');
        }
        // If user logged in, switch to city if available
        else if (!prevAuthState && hasAuth) {
          const userData = getUserData();
          console.log('User logged in - switching to city', userData?.cityId);
          if (userData?.cityId) {
            setDataSource('city');
            fetchData('city');
          }
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('udealzone-auth-storage-changed', handleStorageChange);
      return () => {
        window.removeEventListener('udealzone-auth-storage-changed', handleStorageChange);
      };
    }
  }, [authState, fetchData]);

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      const userData = getUserData();
      const hasAuth = isAuthenticated();
      
      // Determine initial data source
      let initialSourceToUse = initialSource;
      
      // Only use city if authenticated
      if (hasAuth && userData?.cityId) {
        initialSourceToUse = 'city';
      } else {
        initialSourceToUse = 'default';
      }
      
      setAuthState(hasAuth);
      await fetchData(initialSourceToUse);
    };

    initializeData();
  }, [fetchData, initialSource]);

  // Switch data source
  const switchDataSource = useCallback(async (newSource: HomeDataSource, coords?: { lat: number; lng: number }) => {
    const hasAuth = isAuthenticated();

    // Prevent switching to city if not authenticated
    if (newSource === 'city' && !hasAuth) {
      console.warn('Cannot switch to city data - user not authenticated');
      setDataSource('default');
      await fetchData('default');
      return;
    }

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
    isAuthenticated: authState,
  };
};