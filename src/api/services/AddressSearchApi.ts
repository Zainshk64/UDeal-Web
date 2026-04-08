import apiClient from './api';

export interface AutocompleteResult {
  placeId: string;
  mainText: string;
  secondaryText: string | null;
  lat: number | null;
  lng: number | null;
  displayText: string;
}

export interface AutocompleteResponse {
  success: boolean;
  data: AutocompleteResult[];
}

export interface SelectAddressResponse {
  success: boolean;
  data: {
    placeId: string;
    mainText: string;
    secondaryText: string | null;
    lat: number;
    lng: number;
    displayText: string;
  };
}

export interface City {
  cityId: number;
  cityName: string;
}

export interface ProductMeta {
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
}

export interface LocationProduct {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  MarkAsSold: boolean | null;
  Address: string;
  TimeAgo: string;
  IsFeatured: boolean;
  IsFavorite: boolean;
  MainPicPath: string | null;
  MainPicThumbnail: string | null;
  DistanceKm: number;
}

export interface ProductsByLocationResponse {
  meta: ProductMeta[];
  products: LocationProduct[];
}

export const searchAddress = async (query: string): Promise<AutocompleteResult[]> => {
  if (query.length < 3) return [];
  try {
    const response = await apiClient.get<AutocompleteResponse>('/address/autocomplete', {
      params: { q: query },
    });
    if (response.data.success && response.data.data) return response.data.data;
    return [];
  } catch {
    return [];
  }
};

export const selectAddress = async (placeId: string): Promise<SelectAddressResponse['data'] | null> => {
  try {
    const response = await apiClient.post<SelectAddressResponse>('/address/select', { placeId });
    if (response.data.success && response.data.data) return response.data.data;
    return null;
  } catch {
    return null;
  }
};

export const getAllCities = async (): Promise<City[]> => {
  try {
    const response = await apiClient.get<City[]>('/Default/cities');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getProductsByLocation = async (params: {
  longitude: number;
  latitude: number;
  userId?: number | null;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ProductsByLocationResponse> => {
  try {
    const queryParams: Record<string, string | number> = {
      ln: params.longitude,
      lt: params.latitude,
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 30,
    };
    if (params.userId) queryParams.UserId = params.userId;
    const response = await apiClient.get<ProductsByLocationResponse>('/products/GetProductsByLocation', {
      params: queryParams,
    });
    return response.data;
  } catch {
    return { meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }], products: [] };
  }
};

export const getCategoryProductsByLocation = async (params: {
  catId: number;
  longitude: number;
  latitude: number;
  userId?: number | null;
  pageNumber?: number;
  pageSize?: number;
}): Promise<ProductsByLocationResponse> => {
  const id = Math.trunc(Number(params.catId));
  if (!Number.isFinite(id) || id < 1) {
    return { meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }], products: [] };
  }
  try {
    const queryParams: Record<string, string | number> = {
      CatId: id,
      ln: params.longitude,
      lt: params.latitude,
      PageNumber: params.pageNumber || 1,
      PageSize: params.pageSize || 30,
    };
    if (params.userId) queryParams.UserId = params.userId;
    const response = await apiClient.get<ProductsByLocationResponse>(
      '/products/GetCategoryProductsByLocation',
      { params: queryParams },
    );
    return response.data;
  } catch {
    return { meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }], products: [] };
  }
};

export const getProductImageUrl = (path: string | null): string => {
  if (!path) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (path.startsWith('http')) return path;
  return `https://udealzone.com/Members/${path}`;
};

