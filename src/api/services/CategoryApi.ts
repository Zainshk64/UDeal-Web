import apiClient from './api';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface CategoryProduct {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  Address: string;
  TimeAgo: string;
  ProductType: string;
  MainPicPath: string | null;
  MainPicThumbnail: string | null;
  MarkAsSold: boolean;
  IsFavorite?: boolean;
  DistanceKm?: number;
}

export interface CategoryProductsMeta {
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
}

export interface CategoryProductsResponse {
  meta: CategoryProductsMeta[];
  products: CategoryProduct[];
}

// ============================================
// GET PRODUCTS BY CATEGORY
// ============================================

export const getCategoryProducts = async (
  catId: number,
  pageNumber: number = 1,
  pageSize: number = 30,
  cityId: number | null = null,
  userId: number | null = null
): Promise<CategoryProductsResponse> => {
  try {
    const params: Record<string, any> = {
      CatId: catId,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (cityId) params.CityId = cityId;
    if (userId) params.UserId = userId;

    const response = await apiClient.get<CategoryProductsResponse>(
      '/products/GetCategoryProducts',
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('Category products error:', error);
    toast.error('Error', { description: 'Failed to load products' });
    return {
      meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }],
      products: [],
    };
  }
};

// ============================================
// SEARCH PRODUCTS IN CATEGORY
// ============================================

export const searchCategoryProducts = async (
  catId: number,
  query: string,
  pageNumber: number = 1,
  pageSize: number = 30,
  cityId: number | null = null,
  userId: number | null = null
): Promise<CategoryProductsResponse> => {
  try {
    const params: Record<string, any> = {
      CatId: catId,
      SearchQuery: query,
      PageNumber: pageNumber,
      PageSize: pageSize,
    };

    if (cityId) params.CityId = cityId;
    if (userId) params.UserId = userId;

    const response = await apiClient.get<CategoryProductsResponse>(
      '/products/GetCategoryProducts',
      { params }
    );

    return response.data;
  } catch (error: any) {
    console.error('Search error:', error);
    return {
      meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }],
      products: [],
    };
  }
};