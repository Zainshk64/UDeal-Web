import apiClient from './api';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

// Enhanced HomeAd interface to handle all 3 API responses
export interface HomeAd {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  MarkAsSold: boolean;
  Address: string;
  TimeAgo: string;
  ProductType: 'Regular' | 'Featured';
  PicPath: string;
  PicThumbnail?: string;
  IsFavorite?: boolean; // Added for logged-in users
  DistanceKm?: number;  // Added for location-based
}

// Generic HomeResponse for all 3 APIs
export interface HomeResponse {
  cities: { CityId: number; CityName: string }[];
  vehicles: HomeAd[];
  bikes: HomeAd[];
  propertysale: HomeAd[];
  propertyrent: HomeAd[];
  mobiles: HomeAd[];
  electronics: HomeAd[];
  furniture: HomeAd[];
  animals: HomeAd[];
  fashion: HomeAd[];
  services: HomeAd[];
}


export interface ProductDetail {
  ProductId: number;
  ProdcutTitle: string;
  CatId: number;
  SubCatId: number;
  Price: number;
  MarkAsSold: boolean;
  Address: string;
  CreatedDateTime: string;
  IsOwner: boolean;
  ProductDescription?: string;
  IsFavorite?: boolean;
  Name: string;
  ContactNo: string;
  CityId?: number;
  CityName?: string | null;
  [key: string]: any;
}

export interface ProductPicture {
  PicPath: string;
  IsMainPic: boolean | null;
  PictureId?: number;
}

export interface ProductMetaData {
  Uid: number;
  MobileNo: string;
  PicPath: string | null;
  Name: string;
  JoinedDate: string;
  TotalAdsPosted: number;
}

export interface ProductDetailResponse {
  Details: ProductDetail[];
  Pictures: ProductPicture[];
  MetaData: ProductMetaData[];
}

// ============================================
// HOME PAGE DATA (Default - for unlogged users)
// ============================================

export const getHomeData = async (): Promise<HomeResponse | null> => {
  try {
    const response = await apiClient.get<HomeResponse>('/Home/Home-Page-default');
    return response.data;
  } catch (error: any) {
    toast.error('Failed to load ads', {
      description: 'Please pull to refresh and try again.',
    });
    console.error('Home API error:', error.response?.data || error.message);
    return null;
  }
};

// ... keep existing functions and add these new ones if not present
export const getHomeDataByCity = async (
  cityId: number,
  userId: number
): Promise<HomeResponse | null> => {
  try {
    const response = await apiClient.get<HomeResponse>('/Home/Home-Page-ByCity', {
      params: { CityId: cityId, UserId: userId },
    });
    return response.data;
  } catch (error: any) {
    console.error('City API error:', error);
    return null;
  }
};

export const getHomeDataByLocation = async (
  longitude: number,
  latitude: number,
  userId?: number
): Promise<HomeResponse | null> => {
  try {
    const params: Record<string, any> = { ln: longitude, lt: latitude };
    if (userId) params.UserId = userId;

    const response = await apiClient.get<HomeResponse>('/Home/Home-Page-By-Location', {
      params,
    });
    return response.data;
  } catch (error: any) {
    console.error('Location API error:', error);
    return null;
  }
};;

// ============================================
// TOGGLE FAVORITE
// ============================================

export const toggleFavorite = async (
  productId: number,
  userId: number
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post('/ProductAction/UpsertFavorites', null, {
      params: {
        productId,
        userId,
      },
    });
    return {
      success: true,
      message: response.data?.returnText || 'Favorite updated',
    };
  } catch (error: any) {
    console.error('Toggle favorite error:', error.message);
    return {
      success: false,
      message: 'Failed to update favorite',
    };
  }
};

// ============================================
// GET PRODUCT BY ID (Detail Page)
// ============================================

export const getProductById = async (
  id: number,
  isgeneral: boolean = false,
  userId: number | null = null
): Promise<ProductDetailResponse | null> => {
  try {
    const response = await apiClient.get<ProductDetailResponse>(
      `/products/GetProductbyId?Id=${id}&isgeneral=${isgeneral}&UserId=${userId || 0}`
    );
    return response.data;
  } catch (error: any) {
    console.error('Product detail error:', error.response?.data || error.message);
    toast.error('Error', {
      description: 'Failed to load product details',
    });
    return null;
  }
};

// ============================================
// GET CATEGORIES
// ============================================

export const getCategories = async (): Promise<
  { CategoryId: number; CategoryName: string }[]
> => {
  try {
    const response = await apiClient.get('/Default/categories');
    return response.data || [];
  } catch (error: any) {
    console.error('Get categories error:', error);
    return [];
  }
};

// ============================================
// GET SUBCATEGORIES
// ============================================

export const getSubcategories = async (categoryId: number): Promise<
  { SubCategoryId: number; SubCategoryName: string }[]
> => {
  try {
    const response = await apiClient.get('/Default/subcategories', {
      params: {
        catid: categoryId,
      },
    });
    return response.data || [];
  } catch (error: any) {
    console.error('Get subcategories error:', error);
    return [];
  }
};
