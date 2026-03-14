'use client';

import { useState, useCallback } from 'react';
import { toggleFavorite } from '@/src/api/services/HomeApi';
import { useAuth } from '@/src/context/AuthContext';
import { toast } from 'sonner';

export const useFavorite = () => {
  const { isAuthenticated, user } = useAuth();
  const [loadingFavId, setLoadingFavId] = useState<number | null>(null);

  const handleFavoriteToggle = useCallback(
    async (
      productId: number,
      currentFavStatus: boolean,
      onSuccess?: () => void
    ) => {
      if (!isAuthenticated || !user?.userId) {
        toast.info('Login Required', {
          description: 'Please login to add items to favorites',
        });
        return;
      }

      setLoadingFavId(productId);

      try {
        const result = await toggleFavorite(productId, user.userId);

        if (result.success) {
          onSuccess?.();
          toast.success(
            currentFavStatus
              ? 'Removed from Favorites'
              : 'Added to Favorites',
            { description: result.message }
          );
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Favorite toggle error:', error);
        toast.error('Error', {
          description: 'Failed to update favorite',
        });
      } finally {
        setLoadingFavId(null);
      }
    },
    [isAuthenticated, user?.userId]
  );

  return { loadingFavId, handleFavoriteToggle };
};