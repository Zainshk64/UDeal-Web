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

export interface AssignAdPayload {
  planReqId: number;
  memberId: number;
  productId: number;
}

// ============================================
// GET MY ADS
// ============================================

export const getMyAds = async (userId: number): Promise<MyAdItem[]> => {
  try {
    const response = await apiClient.get(
      `/products/GetProductsByUser?userId=${userId}`
    );
    return response.data || [];
  } catch (error: any) {
    console.error('My Ads error:', error.response?.data || error.message);
    toast.error('Error', { description: 'Failed to load your ads' });
    return [];
  }
};

// ============================================
// MARK AS SOLD
// ============================================

export const markAsSold = async (productId: number): Promise<boolean> => {
  try {
    const response = await apiClient.post(
      `/ProductAction/MarkAsSold?productId=${productId}`
    );
    toast.success('Marked as Sold!', {
      description: response.data?.message || 'Ad marked as sold',
    });
    return true;
  } catch (error: any) {
    console.error('MarkAsSold error:', error.response?.data);
    toast.error('Error', { description: 'Failed to mark as sold' });
    return false;
  }
};

// ============================================
// DELETE PRODUCT
// ============================================

export const deleteProduct = async (productId: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete('/products/DeleteProduct', {
      params: { productId },
    });
    if (response.data?.success || response.data?.returnCode) {
      toast.success('Deleted!', { description: 'Ad has been removed' });
      return true;
    }
    return false;
  } catch (error: any) {
    console.error('Delete error:', error.response?.data || error.message);
    toast.error('Error', { description: 'Failed to delete ad' });
    return false;
  }
};

// ============================================
// ASSIGN AD TO FEATURED PLAN
// ============================================

export const assignAdToFeaturedPlan = async (
  payload: AssignAdPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/Default/AssignAd', payload);
    const message =
      typeof response.data === 'string'
        ? response.data
        : response.data?.message || 'Ad featured successfully';
    return { success: true, message };
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data ||
      'Failed to feature ad';
    return {
      success: false,
      message: typeof errorMessage === 'string' ? errorMessage : 'Failed to feature ad',
    };
  }
};