import apiClient from './api';
import { toast } from 'sonner';
import { getUserData } from '@/src/utils/storage';

// ============================================
// TYPES
// ============================================

export interface FeaturedPlan {
  PlanReqID: number;
  TotalProducts: number;
  RemainingProducts: number;
  PlanTitle: string;
  PlanDescription: string;
  Price: number;
  PlanStatus: 'Expired' | 'Active' | string;
  DaysPassedSinceExpired: number;
}

export interface BundlePlan {
  adPlanId: number;
  adPlanName: string;
  description: string;
  price: number;
  discount: number;
  type: string;
  duration_Days: number;
}

export interface PromoValidationResponse {
  result: boolean;
  message?: string;
}

// ============================================
// GET MY PACKAGES
// ============================================

export const getMyPackages = async (): Promise<{
  success: boolean;
  data: FeaturedPlan[];
  isLoggedIn: boolean;
  error?: string;
}> => {
  try {
    const userData = getUserData();

    if (!userData?.userId) {
      return { success: false, data: [], isLoggedIn: false, error: 'Not logged in' };
    }

    const response = await apiClient.get('/Default/UserFeaturedPlans', {
      params: { memberId: userData.userId },
    });

    return {
      success: true,
      data: response.data?.FeaturedPlans || [],
      isLoggedIn: true,
    };
  } catch (error: any) {
    console.error('My Packages Error:', error.response?.data || error.message);
    return {
      success: false,
      data: [],
      isLoggedIn: true,
      error: error.response?.data?.message || 'Failed to fetch packages',
    };
  }
};

// ============================================
// GET ALL PACKAGES (View Packages)
// ============================================

export const getAllPackages = async (): Promise<BundlePlan[]> => {
  try {
    const response = await apiClient.get('/Default/Bundles/Packages');
    return response.data || [];
  } catch (error: any) {
    toast.error('Error', { description: 'Failed to load packages' });
    console.error('Packages API error:', error);
    return [];
  }
};

// ============================================
// ADD PROMO CODE
// ============================================

export const addPromoCode = async (
  promocode: string,
  userId: number
): Promise<{ result: boolean; message: string }> => {
  if (!promocode.trim()) return { result: false, message: 'Please enter a promo code' };
  if (!userId) return { result: false, message: 'Please log in first' };

  try {
    const response = await apiClient.post(
      `/Default/AddPromo?promocode=${promocode.trim()}&userId=${userId}`
    );
    const ok = response?.data === true || response?.status === 200;
    return {
      result: ok,
      message: ok ? 'Promo code applied!' : response?.data?.message || 'Invalid promo code',
    };
  } catch (error: any) {
    return {
      result: false,
      message: error?.response?.data?.message || 'Failed to apply promo code',
    };
  }
};

// ============================================
// HELPERS
// ============================================

export const formatPrice = (price: number): string => {
  return price.toLocaleString('en-PK');
};

export const calculatePricing = (
  price: number,
  discount: number,
  hasPromoApplied: boolean
) => {
  const hasDiscount = discount > 0;
  const discountedPrice = hasDiscount ? price - discount : price;

  return {
    hasDiscount,
    originalPrice: price,
    discountedPrice,
    finalPrice: hasPromoApplied && hasDiscount ? discountedPrice : price,
    strikePrice: hasDiscount
      ? hasPromoApplied
        ? price
        : discountedPrice
      : null,
    savings: hasPromoApplied && hasDiscount ? discount : 0,
  };
};