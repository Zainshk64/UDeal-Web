'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FiMapPin, FiX } from 'react-icons/fi';
import { Button } from '../ui/Button';
import { useLocation } from '@/hooks/useLocation';
import { cn } from '@/src/utils/cn';

interface LocationToggleProps {
  onLocationChange: (coords: { lat: number; lng: number } | null) => void;
  currentCoords: { lat: number; lng: number } | null;
  className?: string;
}

export const LocationToggle: React.FC<LocationToggleProps> = ({
  onLocationChange,
  currentCoords,
  className,
}) => {
  const { 
    requestLocationPermission, 
    clearLocation, 
    isLoading, 
    error 
  } = useLocation();

  const handleEnableLocation = async () => {
    const success = await requestLocationPermission();
    if (success && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          onLocationChange({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error('Error getting coordinates:', error);
        }
      );
    }
  };

  const handleDisableLocation = () => {
    clearLocation();
    onLocationChange(null);
  };

  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-start sm:items-center", className)}>
      {!currentCoords ? (
        <Button
          variant="outline"
          size="md"
          icon={<FiMapPin className="w-5 h-5" />}
          onClick={handleEnableLocation}
          disabled={isLoading}
          className="border-[#F97316] text-[#F97316] hover:bg-[#F97316]"
        >
          {isLoading ? 'Getting Location...' : 'Near My Location'}
        </Button>
      ) : (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2">
          <FiMapPin className="w-5 h-5 text-green-600" />
          <span className="text-green-800 font-medium">Location Enabled</span>
          <button
            onClick={handleDisableLocation}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-100 rounded-full transition-colors"
            title="Disable location"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-600 text-sm mt-2 sm:mt-0"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};