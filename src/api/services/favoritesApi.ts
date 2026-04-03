import apiClient from './api';

// ============================================
// TYPES
// ============================================

export interface FavoriteMeta {
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
}

export interface FavoriteProduct {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  Address: string;
  TimeAgo: string;
  IsFeatured: boolean;
  MainPicPath: string | null;
  MainPicThumbnail: string | null;
}

export interface FavoriteProductsResponse {
  meta: FavoriteMeta[];
  products: FavoriteProduct[];
}

// ============================================
// API
// ============================================

/**
 * Get user's favorite products with pagination.
 */
export const getFavoriteProducts = async (
  userId: number,
  pageNumber: number = 1,
  pageSize: number = 30
): Promise<FavoriteProductsResponse> => {
  try {
    const response = await apiClient.get<FavoriteProductsResponse>(
      '/ProductAction/GetFavouriteProducts',
      {
        params: {
          UserId: userId,
          PageNumber: pageNumber,
          PageSize: pageSize,
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error('Get favorites error:', error);
    return {
      meta: [{ PageNumber: 1, PageSize: pageSize, TotalCount: 0 }],
      products: [],
    };
  }
};
