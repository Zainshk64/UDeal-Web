import apiClient from '../api';

// ============================================
// TYPES
// ============================================

export interface DropdownOption {
  id: number;
  name: string;
}

export interface FormFieldResponse {
  activeFields: { FieldName: string }[];
  /** Minimum allowed price for this subcategory, when configured */
  priceRange?: { MinPrice: number }[];
  provinces?: { Id: number; Name: string }[];
  makeYears?: { Id: number; Name: string }[];
  fuelTypes?: { Id: number; Name: string }[];
  transmissions?: { Id: number; Name: string }[];
  colors?: { Id: number; Name: string }[];
  conditions?: { Id: number; Name: string }[];
  UnitAreas?: { Id: number; Name: string; Area?: string }[];
  [key: string]: unknown;
}

// ============================================
// GET PRODUCT FORM FIELDS
// ============================================

export const getProductForm = async (
  catId: number,
  subCatId: number
): Promise<FormFieldResponse> => {
  try {
    const response = await apiClient.get('/Default/product-form', {
      params: { catId, subCatId },
    });
    return response.data;
  } catch (error) {
    console.error('Get form fields error:', error);
    return { activeFields: [] };
  }
};

// ============================================
// DROPDOWN APIs
// ============================================

export const getCities = async (): Promise<DropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/cities');
    return response.data.map((c: any) => ({ id: c.cityId || c.Id, name: c.cityName || c.Name }));
  } catch { return []; }
};

export const getCitiesByProvince = async (provinceId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/citiesbyprovinces?Pid=${provinceId}`);
    return response.data.map((c: any) => ({ id: c.cityId || c.Id, name: c.cityName || c.Name }));
  } catch { return []; }
};

export const getMakeCompanies = async (catId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/MakeCompanies?Catid=${catId}`);
    return response.data.map((c: any) => ({ id: c.makeId || c.Id, name: c.makerName || c.Name }));
  } catch { return []; }
};

export const getBrands = async (makeCompanyId: number): Promise<DropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/Brands?Cid=${makeCompanyId}`);
    return response.data.map((b: any) => ({ id: b.brandId || b.Id, name: b.brandName || b.Name }));
  } catch { return []; }
};