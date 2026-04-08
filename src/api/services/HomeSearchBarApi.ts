import apiClient from './api';

export interface SuggestItem {
  productId: number;
  productTitle: string;
}

export interface FilteredSearchResponse {
  totalHits: number;
  hits: SuggestItem[];
  page: number;
  pageSize: number;
  normalizedQuery: string;
  fromCache: boolean;
  correlationId: string;
}

export interface SearchProduct {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  MarkAsSold: boolean | null;
  Address: string;
  TimeAgo: string;
  ProductType: string;
  PicPath: string | null;
  IsFavorite?: boolean;
}

export interface SearchProductsResponse {
  Products: SearchProduct[];
}

export interface CategoryItem {
  catId: number;
  categoryName: string;
}

export interface SubcategoryItem {
  subCatId: number;
  subcategoryName: string;
}

export interface ProvinceItem {
  provId: number;
  provinceName: string;
}

export interface CityItem {
  cityId: number;
  cityName: string;
}

export interface MakeCompanyItem {
  makeId: number;
  makerName: string;
}

export interface BrandItem {
  brandId: number;
  brandName: string;
}

export interface YearItem {
  myId: number;
  makeYear: string;
}

export interface FilterState {
  catId: number | null;
  subCatId: number | null;
  provinceId: number | null;
  cityId: number | null;
  makeId: number | null;
  brandId: number | null;
  makeYearId: number | null;
  minPrice: string;
  maxPrice: string;
}

export const DEFAULT_FILTERS: FilterState = {
  catId: null,
  subCatId: null,
  provinceId: null,
  cityId: null,
  makeId: null,
  brandId: null,
  makeYearId: null,
  minPrice: '',
  maxPrice: '',
};

export const getSuggestions = async (
  query: string,
  page: number = 1,
  pageSize: number = 30,
): Promise<SuggestItem[]> => {
  if (query.length < 2) return [];
  try {
    const response = await apiClient.get<SuggestItem[]>('/AutoCompleteSearchController/suggest', {
      params: { q: query, page, pageSize },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getFilteredSuggestions = async (
  query: string,
  filters: FilterState,
  page: number = 1,
  pageSize: number = 30,
): Promise<FilteredSearchResponse> => {
  if (query.length < 2) {
    return {
      totalHits: 0,
      hits: [],
      page: 1,
      pageSize,
      normalizedQuery: query,
      fromCache: false,
      correlationId: '',
    };
  }

  const params: Record<string, string | number> = {
    Q: query,
    Page: page,
    PageSize: pageSize,
  };
  if (filters.catId) params.CatId = filters.catId;
  if (filters.subCatId) params.SubCatId = filters.subCatId;
  if (filters.provinceId) params.ProvinceId = filters.provinceId;
  if (filters.cityId) params.CityId = filters.cityId;
  if (filters.makeId) params.MakeId = filters.makeId;
  if (filters.brandId) params.BrandId = filters.brandId;
  if (filters.makeYearId) params.MYId = filters.makeYearId;
  if (filters.minPrice && Number(filters.minPrice) > 0) params.MinPrice = Number(filters.minPrice);
  if (filters.maxPrice && Number(filters.maxPrice) > 0) params.MaxPrice = Number(filters.maxPrice);

  try {
    const response = await apiClient.get<FilteredSearchResponse>('/AutoCompleteSearchController', {
      params,
    });
    return (
      response.data || {
        totalHits: 0,
        hits: [],
        page: 1,
        pageSize,
        normalizedQuery: query,
        fromCache: false,
        correlationId: '',
      }
    );
  } catch {
    return {
      totalHits: 0,
      hits: [],
      page: 1,
      pageSize,
      normalizedQuery: query,
      fromCache: false,
      correlationId: '',
    };
  }
};

export const getProductsByIds = async (productIds: number[]): Promise<SearchProduct[]> => {
  if (productIds.length === 0) return [];
  try {
    const response = await apiClient.post<SearchProductsResponse>(
      '/products/GetProductsforAutoCompleteSearch',
      productIds,
    );
    return response.data?.Products || [];
  } catch {
    return [];
  }
};

export const getCategories = async (): Promise<CategoryItem[]> => {
  try {
    const response = await apiClient.get<CategoryItem[]>('/Default/categories');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getSubcategories = async (catId: number): Promise<SubcategoryItem[]> => {
  try {
    const response = await apiClient.get<SubcategoryItem[]>('/Default/subcategories', {
      params: { catid: catId },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getProvinces = async (): Promise<ProvinceItem[]> => {
  try {
    const response = await apiClient.get<ProvinceItem[]>('/Default/provinces');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getCities = async (): Promise<CityItem[]> => {
  try {
    const response = await apiClient.get<CityItem[]>('/Default/cities');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getCitiesByProvince = async (provinceId: number): Promise<CityItem[]> => {
  try {
    const response = await apiClient.get<CityItem[]>('/Default/citiesbyprovinces', {
      params: { Pid: provinceId },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getMakeCompanies = async (catId: number): Promise<MakeCompanyItem[]> => {
  try {
    const response = await apiClient.get<MakeCompanyItem[]>('/Default/MakeCompanies', {
      params: { Catid: catId },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getMakeYears = async (): Promise<YearItem[]> => {
  try {
    const response = await apiClient.get<YearItem[]>('/Default/MakeYears');
    return response.data || [];
  } catch {
    return [];
  }
};

export const getBrands = async (companyId: number): Promise<BrandItem[]> => {
  try {
    const response = await apiClient.get<BrandItem[]>('/Default/Brands', {
      params: { Cid: companyId },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getSearchImageUrl = (path: string | null): string => {
  if (!path) return 'https://via.placeholder.com/300x200?text=No+Image';
  if (path.startsWith('http')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `https://udealzone.com/Members/${cleanPath}`;
};

export const hasActiveFilters = (filters: FilterState): boolean => {
  return Boolean(
    filters.catId ||
      filters.subCatId ||
      filters.provinceId ||
      filters.cityId ||
      filters.makeId ||
      filters.brandId ||
      filters.makeYearId ||
      (filters.minPrice && Number(filters.minPrice) > 0) ||
      (filters.maxPrice && Number(filters.maxPrice) > 0),
  );
};

