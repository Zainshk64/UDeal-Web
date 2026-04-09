import apiClient from './api';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface CityOption {
  cityId: number;
  cityName: string;
}

export interface CityProduct {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  Address: string;
  TimeAgo: string;
  IsFeatured: boolean;
  MainPicPath: string | null;
  MainPicThumbnail: string | null;
  IsFavorite: boolean;
}

export interface CityProductsMeta {
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
}

export interface CityProductsResponse {
  meta: CityProductsMeta[];
  products: CityProduct[];
}

// ============================================
// GET ALL CITIES
// ============================================

export const getAllCities = async (): Promise<CityOption[]> => {
  try {
    const response = await apiClient.get<CityOption[]>('/Default/cities');
    return response.data || [];
  } catch (error: any) {
    console.error('Get cities error:', error);
    return [];
  }
};

// ============================================
// GET PRODUCTS BY CITY
// ============================================

export const getCityProducts = async (
  cityId: number,
  pageNumber: number = 1,
  pageSize: number = 30,
  userId: number | null = null
): Promise<CityProductsResponse> => {
  try {
    const params: Record<string, any> = {
      CityId: cityId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (userId) params.UserId = userId;

    const response = await apiClient.get<CityProductsResponse>(
      '/products/GetCityProducts',
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('City products error:', error);
    toast.error('Error', { description: 'Failed to load products' });
    return {
      meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }],
      products: [],
    };
  }
};

// ============================================
// IMAGE URL
// ============================================

export const getCityProductImage = (path: string | null): string => {
  if (!path) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (path.startsWith('http')) return path;
  return `https://udealzone.com/Members/${path}`;
};