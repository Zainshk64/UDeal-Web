'use client';

import { useState, useEffect } from 'react';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  isLoading: boolean;
}

export const useLocation = () => {
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    error: null,
    isLoading: false,
  });

  const requestLocationPermission = async (): Promise<boolean> => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
      }));
      return false;
    }

    setLocation(prev => ({ ...prev, isLoading: true }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({
            latitude,
            longitude,
            error: null,
            isLoading: false,
          });
          resolve(true);
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Please allow location access to see nearby products';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
          }
          setLocation({
            latitude: null,
            longitude: null,
            error: errorMessage,
            isLoading: false,
          });
          resolve(false);
        }
      );
    });
  };

  const clearLocation = () => {
    setLocation({
      latitude: null,
      longitude: null,
      error: null,
      isLoading: false,
    });
  };

  return {
    ...location,
    requestLocationPermission,
    clearLocation,
  };
};