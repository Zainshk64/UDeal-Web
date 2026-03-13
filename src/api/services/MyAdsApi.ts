import apiClient from './api';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface MyAdItem {
  productId: number;
  prodcutTitle: string;
  productDescription: string;
  price: number;
  address: string;
  createdDateTime: string;
  isFeatured: boolean;
  enable: boolean;
  markAsSold: boolean;
  image: string | null;
  viewsCount: number;
}

export interface MyAdsResponse {
  returnCode: boolean;
  returnText: string;
  data?: MyAdItem[];
}

// ============================================
// GET MY ADS
// ============================================

export const getMyAds = async (userId: number): Promise<MyAdItem[]> => {
  try {
    const response = await apiClient.get<MyAdsResponse>('/MyAds/GetMyAds', {
      params: {
        UserId: userId,
      },
    });

    if (response.data.returnCode && response.data.data) {
      return response.data.data;
    }

    return [];
  } catch (error: any) {
    console.error('Get my ads error:', error.response?.data || error.message);
    toast.error('Failed to load your ads', {
      description: 'Please try again later.',
    });
    return [];
  }
};

// ============================================
// DELETE AD
// ============================================

export const deleteAd = async (productId: number, userId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post('/MyAds/DeleteProduct', null, {
      params: {
        productId,
        UserId: userId,
      },
    });

    if (response.data.returnCode) {
      toast.success('Ad deleted successfully');
      return true;
    } else {
      toast.error('Failed to delete ad', {
        description: response.data.returnText || 'Please try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || 'Failed to delete ad';
    toast.error('Error', { description: msg });
    console.error('Delete ad error:', error);
    return false;
  }
};

// ============================================
// MARK AS SOLD
// ============================================

export const markAsSold = async (productId: number, userId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post('/MyAds/MarkAsSold', null, {
      params: {
        productId,
        UserId: userId,
      },
    });

    if (response.data.returnCode) {
      toast.success('Product marked as sold');
      return true;
    } else {
      toast.error('Failed to mark as sold', {
        description: response.data.returnText || 'Please try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || 'Failed to mark as sold';
    toast.error('Error', { description: msg });
    console.error('Mark as sold error:', error);
    return false;
  }
};

// ============================================
// TOGGLE FEATURED
// ============================================

export const toggleFeatured = async (
  productId: number,
  userId: number,
  isFeatured: boolean
): Promise<boolean> => {
  try {
    const response = await apiClient.post('/MyAds/ToggleFeatured', null, {
      params: {
        productId,
        UserId: userId,
        isFeatured: !isFeatured,
      },
    });

    if (response.data.returnCode) {
      toast.success(isFeatured ? 'Removed from featured' : 'Added to featured');
      return true;
    } else {
      toast.error('Failed to update', {
        description: response.data.returnText || 'Please try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || 'Failed to update';
    toast.error('Error', { description: msg });
    console.error('Toggle featured error:', error);
    return false;
  }
};

// ============================================
// EDIT AD
// ============================================

export const updateAd = async (
  productId: number,
  userId: number,
  updates: Record<string, any>
): Promise<boolean> => {
  try {
    const response = await apiClient.post('/MyAds/UpdateProduct', updates, {
      params: {
        productId,
        UserId: userId,
      },
    });

    if (response.data.returnCode) {
      toast.success('Ad updated successfully');
      return true;
    } else {
      toast.error('Failed to update ad', {
        description: response.data.returnText || 'Please try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || 'Failed to update ad';
    toast.error('Error', { description: msg });
    console.error('Update ad error:', error);
    return false;
  }
};
