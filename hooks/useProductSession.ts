'use client';

import { useEffect, useRef } from 'react';
import { addProductToUserSession } from '@/src/api/services/UserSessionApi';

/**
 * Tracks product view session
 * Fires after 15 seconds on page
 * Cancels if user leaves early
 */
export const useProductSession = (productId?: number) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!productId) return;

    console.log('Session timer started for product:', productId);

    timerRef.current = setTimeout(() => {
      console.log('15s completed for product:', productId);
      addProductToUserSession(productId);
    }, 15000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        console.log('Session timer cleared for product:', productId);
      }
    };
  }, [productId]);
};