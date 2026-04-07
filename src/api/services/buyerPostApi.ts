import { toast } from 'sonner';
import apiClient from './api';

export interface BuyerCategory {
  catId: number;
  categoryName: string;
  icon?: string;
}

export interface BuyerSubcategory {
  subCatId: number;
  subcategoryName: string;
}

export interface BuyerDropdownOption {
  id: number;
  name: string;
}

export const getBuyerCategories = async (): Promise<BuyerCategory[]> => {
  try {
    const response = await apiClient.get('/Default/categories');
    return response.data || [];
  } catch {
    toast.error('Failed to load categories');
    return [];
  }
};

export const getBuyerSubcategories = async (catId: number): Promise<BuyerSubcategory[]> => {
  try {
    const response = await apiClient.get(`/Default/subcategories?catId=${catId}`);
    return response.data || [];
  } catch {
    toast.error('Failed to load subcategories');
    return [];
  }
};

export const getProvinces = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/provinces');
    return (response.data || []).map((p: { provId: number; provinceName: string }) => ({
      id: p.provId,
      name: p.provinceName,
    }));
  } catch {
    return [];
  }
};

export const getCitiesByProvinceBuyer = async (
  provinceId: number
): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/citiesbyprovinces?Pid=${provinceId}`);
    return (response.data || []).map((c: { cityId: number; cityName: string }) => ({
      id: c.cityId,
      name: c.cityName,
    }));
  } catch {
    return [];
  }
};

export const getMakeCompaniesBuyer = async (catId: number): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/MakeCompanies?Catid=${catId}`);
    return (response.data || []).map((c: { makeId: number; makerName: string }) => ({
      id: c.makeId,
      name: c.makerName,
    }));
  } catch {
    return [];
  }
};

export const getBrandsBuyer = async (makeCompanyId: number): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/Brands?Cid=${makeCompanyId}`);
    return (response.data || []).map((b: { brandId: number; brandName: string }) => ({
      id: b.brandId,
      name: b.brandName,
    }));
  } catch {
    return [];
  }
};

export const getMakeYearsBuyer = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/MakeYears');
    return (response.data || []).map((y: { myId: number; makeYear: number | string }) => ({
      id: y.myId,
      name: String(y.makeYear),
    }));
  } catch {
    return [];
  }
};

export const getFuelTypesBuyer = async (catid: number): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get(`/Default/FuelTypes?Catid=${catid}`);
    return (response.data || []).map((f: { fuelTypeId: number; fuelType: string }) => ({
      id: f.fuelTypeId,
      name: f.fuelType,
    }));
  } catch {
    return [];
  }
};

export const getTransmissionsBuyer = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/Transmissions');
    return (response.data || []).map((t: { transId: number; transmission: string }) => ({
      id: t.transId,
      name: t.transmission,
    }));
  } catch {
    return [];
  }
};

export const getConditionsBuyer = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/Conditions');
    return (response.data || []).map(
      (c: { productConditionId: number; productCondition: string }) => ({
        id: c.productConditionId,
        name: c.productCondition,
      })
    );
  } catch {
    return [];
  }
};

export const getColorsBuyer = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/Colors');
    return (response.data || []).map((c: { colorId: number; colorName: string }) => ({
      id: c.colorId,
      name: c.colorName,
    }));
  } catch {
    return [];
  }
};

export const getUnitAreasBuyer = async (): Promise<BuyerDropdownOption[]> => {
  try {
    const response = await apiClient.get('/Default/unitarea');
    return (response.data || []).map((u: { uAid: number; unitArea: string | number }) => ({
      id: u.uAid,
      name: String(u.unitArea),
    }));
  } catch {
    return [];
  }
};

export interface BuyerUpsertRequest {
  productReqId: number;
  categoryId: number;
  CreatedByUid: number;
  data: Record<string, string | number | boolean | null>;
}

function asObjectRecord(x: unknown): Record<string, unknown> | null {
  if (x != null && typeof x === 'object' && !Array.isArray(x)) {
    return x as Record<string, unknown>;
  }
  return null;
}

/** First finite number > 0 from candidates (API often uses PascalCase). */
function firstPositiveInt(...vals: unknown[]): number | undefined {
  for (const v of vals) {
    if (v === null || v === undefined || v === '') continue;
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n) && n > 0) return Math.trunc(n);
  }
  return undefined;
}

/**
 * Normalizes one row from GetBuyerRequestsByUser (camelCase or PascalCase).
 */
export function normalizeBuyerRequestFromApi(item: unknown): BuyerRequest | null {
  const r = asObjectRecord(item);
  if (!r) return null;

  const productReqId = firstPositiveInt(r.productReqId, r.ProductReqId);
  if (!productReqId) return null;

  const categoryId = firstPositiveInt(
    r.categoryId,
    r.CategoryId,
    r.CatId,
    r.catId,
  );
  const subCatId = firstPositiveInt(
    r.subCatId,
    r.SubCatId,
    r.subCategoryId,
    r.SubCategoryId,
  );

  const priceRaw = r.price ?? r.Price;
  const priceToRaw = r.priceTo ?? r.PriceTo;
  const p1 =
    typeof priceRaw === 'number'
      ? priceRaw
      : priceRaw != null && priceRaw !== ''
        ? Number(priceRaw)
        : undefined;
  const p2 =
    typeof priceToRaw === 'number'
      ? priceToRaw
      : priceToRaw != null && priceToRaw !== ''
        ? Number(priceToRaw)
        : undefined;

  const base: BuyerRequest = {
    productReqId,
    prodcutTitle: String(r.prodcutTitle ?? r.ProdcutTitle ?? r.RequiredTitle ?? '').trim() || undefined,
    productDescription: String(r.productDescription ?? r.ProductDescription ?? '').trim() || undefined,
    categoryId,
    subCatId,
    price: Number.isFinite(p1 as number) ? (p1 as number) : undefined,
    priceTo: Number.isFinite(p2 as number) ? (p2 as number) : undefined,
    duration:
      r.duration != null && r.duration !== ''
        ? String(r.duration)
        : r.Duration != null && r.Duration !== ''
          ? String(r.Duration)
          : null,
    createdDateTime:
      r.createdDateTime != null
        ? String(r.createdDateTime)
        : r.CreatedDateTime != null
          ? String(r.CreatedDateTime)
          : undefined,
    categoryName:
      r.categoryName != null
        ? String(r.categoryName)
        : r.CategoryName != null
          ? String(r.CategoryName)
          : undefined,
    subCategoryName:
      r.subCategoryName != null
        ? String(r.subCategoryName)
        : r.SubCategoryName != null
          ? String(r.SubCategoryName)
          : undefined,
    contactNo:
      r.contactNo != null
        ? String(r.contactNo)
        : r.ContactNo != null
          ? String(r.ContactNo)
          : undefined,
    address: r.address != null ? String(r.address) : r.Address != null ? String(r.Address) : undefined,
  };

  return { ...r, ...base } as BuyerRequest;
}

export interface BuyerRequest {
  productReqId: number;
  prodcutTitle?: string;
  productDescription?: string;
  price?: number;
  priceTo?: number;
  reqType?: string | null;
  duration?: string | null;
  createdDateTime?: string;
  enable?: boolean | null;
  termsAgreement?: boolean | null;
  reqTillDate?: string | null;
  address?: string;
  categoryId?: number;
  subCatId?: number;
  categoryName?: string;
  subCategoryName?: string;
  contactNo?: string;
  showMyContactNo?: boolean;
  cityId?: number;
  cityName?: string;
  provinceId?: number;
  provinceName?: string;
  makeId?: number;
  brandId?: number;
  conditionId?: number;
  mYid?: number;
  mYearToid?: number;
  fuelId?: number;
  transId?: number;
  engineCapacity?: string;
  mileage?: string;
  colorId?: number;
  unitAreaId?: number;
  unitAreaVal?: number;
  unitAreaValTo?: number;
  bedRooms?: number;
  washrooms?: number;
  isFurnished?: boolean;
  greyStructure?: boolean;
  completed?: boolean;
  [key: string]: unknown;
}

export function prepareFormDataForApi(
  formData: Record<string, unknown>,
  categoryId: number,
  subcategoryId: number,
  createdByUid: number,
  productReqId: number = 0
): BuyerUpsertRequest {
  const data: Record<string, string | number | boolean | null> = {};

  data['UserId'] = createdByUid.toString();
  data['CatId'] = categoryId.toString();
  data['SubCatId'] = subcategoryId.toString();
  data['CreatedByUid'] = createdByUid.toString();
  data['Enable'] = 1;
  data['ReqType'] = 'buyer';

  const fieldMappings: Record<string, string> = {
    ProdcutTitle: 'ProdcutTitle',
    ProductDescription: 'ProductDescription',
    ContactNo: 'ContactNo',
    ShowMyContactNo: 'ShowMyContactNo',
    TermsAndAgreement: 'TermAndAgreements',
    ProvinceId: 'ProvinceId',
    CityId: 'CityId',
    AreaId: 'AreaId',
    Price: 'Price',
    PriceTo: 'PriceTo',
    MakeId: 'MakeId',
    BrandId: 'BrandId',
    MYid: 'MYid',
    MYearToid: 'MYearToid',
    FuelId: 'FuelId',
    TransId: 'TransId',
    ColorId: 'ColorId',
    EngineCapacity: 'EngineCapacity',
    Mileage: 'Mileage',
    RegCityId: 'RegCityId',
    UnitAreaId: 'UnitAreaId',
    UnitAreaVal: 'UnitAreaVal',
    UnitAreaValTo: 'UnitAreaValTo',
    BedRooms: 'BedRooms',
    Washrooms: 'Washrooms',
    IsFurnished: 'IsFurnished',
    GreyStructure: 'GreyStructure',
    Completed: 'Completed',
    Duration: 'Duration',
  };

  Object.entries(fieldMappings).forEach(([formKey, apiKey]) => {
    const value = formData[formKey];
    if (value !== undefined && value !== null && value !== '') {
      if (typeof value === 'boolean') {
        data[apiKey] = value;
      } else if (typeof value === 'number') {
        data[apiKey] = value.toString();
      } else {
        data[apiKey] = String(value);
      }
    }
  });

  return {
    productReqId,
    categoryId,
    CreatedByUid: createdByUid,
    data,
  };
}

export async function submitBuyerRequest(
  formData: Record<string, unknown>,
  categoryId: number,
  subcategoryId: number,
  createdByUid: number,
  productReqId: number = 0
): Promise<{ success: boolean; message: string; productReqId?: number }> {
  const isEdit = productReqId > 0;
  try {
    const requestPayload = prepareFormDataForApi(
      formData,
      categoryId,
      subcategoryId,
      createdByUid,
      productReqId
    );
    const response = await apiClient.post('/Buyers/Buyer-Upsert', requestPayload);
    const pid = response.data?.productReqId ?? response.data?.ProductReqId ?? productReqId;
    toast.success(isEdit ? 'Request updated' : 'Request posted');
    return {
      success: true,
      message: response.data?.message || 'OK',
      productReqId: pid,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string; title?: string } }; message?: string };
    const errorMsg =
      err.response?.data?.message ||
      err.response?.data?.title ||
      err.message ||
      'Failed to submit request';
    toast.error(errorMsg);
    return { success: false, message: errorMsg };
  }
}

export const getMyBuyerRequests = async (userId: number): Promise<BuyerRequest[]> => {
  try {
    const response = await apiClient.get<unknown>('/Buyers/GetBuyerRequestsByUser', {
      params: { userId },
    });
    const raw = response.data;
    if (raw == null) return [];

    let rows: unknown[] = [];
    if (Array.isArray(raw)) {
      rows = raw;
    } else if (asObjectRecord(raw)) {
      const o = asObjectRecord(raw)!;
      const nested = o.items ?? o.Items ?? o.data ?? o.Data ?? o.results ?? o.Results;
      if (Array.isArray(nested)) {
        rows = nested;
      } else {
        const one = normalizeBuyerRequestFromApi(raw);
        return one ? [one] : [];
      }
    }

    const out: BuyerRequest[] = [];
    for (const item of rows) {
      const n = normalizeBuyerRequestFromApi(item);
      if (n) out.push(n);
    }
    return out;
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    // No rows / not found is not a hard failure — same as empty list
    if (status === 404 || status === 204) return [];
    toast.error('Could not load your requests. Check your connection and try again.');
    return [];
  }
};

export const deleteBuyerRequest = async (productReqId: number): Promise<boolean> => {
  try {
    await apiClient.delete('/Buyers/DeleteRequest', {
      params: { productReqId },
    });
    toast.success('Request deleted');
    return true;
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    toast.error(err.response?.data?.message || 'Failed to delete');
    return false;
  }
};

export const getBuyerRequestById = async (productReqId: number): Promise<BuyerRequest | null> => {
  try {
    const response = await apiClient.get('/Buyers/GetBuyerRequestById', {
      params: { productReqId },
    });
    return response.data || null;
  } catch {
    return null;
  }
};

/** Map API GET shape to form keys (PascalCase) */
export function mapBuyerRequestToFormValues(req: BuyerRequest): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  const raw = req as Record<string, unknown>;
  const title = req.prodcutTitle ?? raw.ProdcutTitle;
  if (title != null) out.ProdcutTitle = title;
  const desc = req.productDescription ?? raw.ProductDescription;
  if (desc != null) out.ProductDescription = desc;
  if (req.price != null) out.Price = req.price;
  if (req.priceTo != null) out.PriceTo = req.priceTo;
  if (req.provinceId != null) out.ProvinceId = req.provinceId;
  if (req.cityId != null) out.CityId = req.cityId;
  if (req.makeId != null) out.MakeId = req.makeId;
  if (req.brandId != null) out.BrandId = req.brandId;
  if (req.mYid != null) out.MYid = req.mYid;
  if (req.mYearToid != null) out.MYearToid = req.mYearToid;
  if (req.fuelId != null) out.FuelId = req.fuelId;
  if (req.transId != null) out.TransId = req.transId;
  if (req.engineCapacity != null) out.EngineCapacity = req.engineCapacity;
  if (req.mileage != null) out.Mileage = req.mileage;
  if (req.colorId != null) out.ColorId = req.colorId;
  if (req.unitAreaId != null) out.UnitAreaId = req.unitAreaId;
  if (req.unitAreaVal != null) out.UnitAreaVal = req.unitAreaVal;
  if (req.unitAreaValTo != null) out.UnitAreaValTo = req.unitAreaValTo;
  if (req.bedRooms != null) out.BedRooms = req.bedRooms;
  if (req.washrooms != null) out.Washrooms = req.washrooms;
  if (req.isFurnished != null) out.IsFurnished = req.isFurnished;
  if (req.greyStructure != null) out.GreyStructure = req.greyStructure;
  if (req.completed != null) out.Completed = req.completed;
  if (req.duration != null) out.Duration = req.duration;
  if (req.contactNo != null) out.ContactNo = req.contactNo;
  if (req.showMyContactNo != null) out.ShowMyContactNo = req.showMyContactNo;
  if (req.termsAgreement != null) out.TermsAndAgreement = req.termsAgreement;
  return out;
}

/**
 * Update an existing buyer request using Buyer-Upsert with fields from "My requests" list row
 * (avoids GetBuyerRequestById when that endpoint is unavailable).
 */
/**
 * GetBuyerRequestsByUser often returns rows without CatId/SubCatId.
 * React Native edit flow passes category 1 / subcategory 1 for Buyer-Upsert in that case — match it here.
 */
const BUYER_UPSERT_FALLBACK_CATEGORY_ID = 1;
const BUYER_UPSERT_FALLBACK_SUBCATEGORY_ID = 1;

function resolveBuyerCategoryIdsForUpsert(row: BuyerRequest): {
  categoryId: number;
  subCatId: number;
} {
  const raw = row as Record<string, unknown>;
  const categoryId = firstPositiveInt(
    row.categoryId,
    raw.CategoryId,
    raw.CatId,
    raw.catId,
  );
  const subCatId = firstPositiveInt(
    row.subCatId,
    raw.SubCatId,
    raw.subCategoryId,
    raw.SubCategoryId,
  );
  return {
    categoryId: categoryId ?? BUYER_UPSERT_FALLBACK_CATEGORY_ID,
    subCatId: subCatId ?? BUYER_UPSERT_FALLBACK_SUBCATEGORY_ID,
  };
}

export async function updateBuyerRequestFromListRow(
  row: BuyerRequest,
  createdByUid: number,
  fields: {
    ProdcutTitle: string;
    ProductDescription: string;
    Price: number;
    PriceTo: number;
    Duration: string;
  },
): Promise<{ success: boolean; message: string; productReqId?: number }> {
  const { categoryId, subCatId } = resolveBuyerCategoryIdsForUpsert(row);
  const base = mapBuyerRequestToFormValues(row);
  const merged: Record<string, unknown> = {
    ...base,
    ProdcutTitle: fields.ProdcutTitle.trim(),
    ProductDescription: fields.ProductDescription.trim(),
    Price: fields.Price,
    PriceTo: fields.PriceTo,
    Duration: fields.Duration.trim(),
  };
  return submitBuyerRequest(merged, categoryId, subCatId, createdByUid, row.productReqId);
}
