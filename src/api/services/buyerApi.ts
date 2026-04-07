import apiClient from './api';

export interface BuyerMeta {
  PageNumber: number;
  PageSize: number;
  TotalCount: number;
}

export interface BuyerCard {
  ProductReqId: number;
  RequiredTitle: string;
  BuyerName: string;
  Address: string;
  PriceRange: string;
  TimeAgo: string;
}

export interface BuyerCardsResponse {
  meta: BuyerMeta[];
  products: BuyerCard[];
}

export interface BuyerDetail {
  ProductReqId: number;
  RequiredTitle: string;
  ProductDescription: string;
  PriceRange: string;
  BuyerName: string;
  ContactNo: string;
  Address: string;
  IsOwner: boolean;
  CategoryName: string;
  SubCategoryName: string;
  ConditionName: string;
  BedRooms: number | null;
  Washrooms: number | null;
  IsFurnished: string | null;
  GreyStructure: string | null;
  Completed: string | null;
  UnitAreaRange: string | null;
  ReqType: string;
  Duration: string | null;
  CreatedDateTime: string;
}

export interface BuyerDetailResponse {
  productrequirements: BuyerDetail[];
}

export interface BuyerCategory {
  catId: number;
  categoryName: string;
  CategoryIcon?: string;
}

export interface BuyerCity {
  cityId: number;
  cityName: string;
}

export const getAllCategories = async (): Promise<BuyerCategory[]> => {
  try {
    const response = await apiClient.get('/Default/categories');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getAllCitiesForBuyers = async (): Promise<BuyerCity[]> => {
  try {
    const response = await apiClient.get('/Default/cities');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getBuyerCards = async (params: {
  catId?: number;
  cityId?: number;
  pageNumber?: number;
  pageSize?: number;
} = {}): Promise<BuyerCardsResponse> => {
  try {
    const queryParams: Record<string, number> = {};
    if (params.catId) queryParams.CatId = params.catId;
    if (params.cityId) queryParams.CityId = params.cityId;
    if (params.pageNumber) queryParams.PageNumber = params.pageNumber;
    if (params.pageSize) queryParams.PageSize = params.pageSize;

    const response = await apiClient.get<BuyerCardsResponse>('/Buyers/GetBuyersCards', {
      params: queryParams,
    });
    return response.data;
  } catch {
    return {
      meta: [{ PageNumber: 1, PageSize: 30, TotalCount: 0 }],
      products: [],
    };
  }
};

export const getBuyerDetail = async (productReqId: number): Promise<BuyerDetail | null> => {
  try {
    const response = await apiClient.get<BuyerDetailResponse>('/Buyers/GetBuyerDetail', {
      params: { ProductReqId: productReqId },
    });
    const list = response.data?.productrequirements;
    if (list?.length) return list[0];
    return null;
  } catch {
    return null;
  }
};

export const formatNumber = (num: number): string => {
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('en-PK');
};

export const formatPriceRange = (priceRange: string): string => {
  if (!priceRange) return 'Price not specified';
  const cleaned = priceRange.replace(/Rupees/gi, '').trim();
  const parts = cleaned.split(/\s*-\s*/);
  if (parts.length === 2) {
    const min = parseInt(parts[0].replace(/\D/g, ''), 10);
    const max = parseInt(parts[1].replace(/\D/g, ''), 10);
    if (!Number.isNaN(min) && !Number.isNaN(max)) {
      return `Rs ${formatNumber(min)} - ${formatNumber(max)}`;
    }
  }
  return priceRange;
};

/** Parse numeric min/max from API price range string for client-side filtering */
export function parseBuyerPriceRangeBounds(priceRange: string): { min: number; max: number } | null {
  if (!priceRange) return null;
  const nums = priceRange.match(/\d+/g)?.map((n) => parseInt(n, 10)) ?? [];
  if (nums.length >= 2) return { min: nums[0], max: nums[1] };
  if (nums.length === 1) return { min: nums[0], max: nums[0] };
  return null;
}

export const formatBuyerDate = (dateString: string): string => {
  try {
    return new Date(dateString).toLocaleDateString('en-PK', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
};
