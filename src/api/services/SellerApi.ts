import apiClient from './api';

// ============================================
// TYPES
// ============================================

export interface ReportAdPayload {
  productId: number;
  complainantId: number;
  keyword: string;
  comment: string;
}

export interface SellerProduct {
  productId: number;
  prodcutTitle: string;
  price: number;
  image: string;
  address: string;
  createdDateTime: string;
  isFeatured: boolean;
  markAsSold: boolean;
  productDescription?: string;
  viewsCount?: number;
  enable?: boolean;
}

// ============================================
// REPORT AD
// ============================================

export const reportAd = async (
  payload: ReportAdPayload
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post(
      '/ProductAction/ReportAd',
      payload
    );
    return {
      success: response.data?.returnCode === true,
      message: response.data?.returnText || 'Report submitted',
    };
  } catch (error: any) {
    console.error('Report Ad Error:', error);
    return {
      success: false,
      message:
        error?.response?.data?.returnText || 'Failed to report ad',
    };
  }
};

// ============================================
// GET SELLER PRODUCTS
// ============================================

export const getProductsByUser = async (
  userId: number
): Promise<SellerProduct[]> => {
  try {
    const response = await apiClient.get(
      `/products/GetProductsByUser?userId=${userId}`
    );
    if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  } catch (error) {
    console.error('Get Seller Products Error:', error);
    return [];
  }
};