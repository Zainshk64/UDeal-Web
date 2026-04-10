import { toast } from 'sonner';
import apiClient from '../api';

// ============================================
// TYPES
// ============================================

export interface EditProductDetail {
  ProductId: number;
  ProdcutTitle: string;
  CatId: number;
  SubCatId: number;
  Price: number;
  Address: string;
  CreatedDateTime: string;
  IsOwner: boolean;
  ProductDescription?: string;
  [key: string]: any;
}

export interface EditProductPicture {
  PicId: number;
  PicPath: string;
  IsMainPic: boolean;
}

export interface EditProductResponse {
  Details: EditProductDetail[];
  Pictures: EditProductPicture[];
  MetaData: any[];
}

// ============================================
// GET PRODUCT FOR EDIT
// ============================================

export const getProductForEdit = async (
  productId: number,
  userId: number
): Promise<EditProductResponse | null> => {
  try {
    const response = await apiClient.get('/products/GetProductbyId-User', {
      params: { Id: productId, UserId: userId },
    });
    return response.data;
  } catch (error: any) {
    console.error('Get product for edit error:', error);
    return null;
  }
};

// ============================================
// UPDATE PRODUCT FIELDS
// ============================================

export const updateProduct = async (
  productId: number,
  categoryId: number,
  data: Record<string, any>
): Promise<boolean> => {
  try {
    const payload = { productId, categoryId, data };
    const response = await apiClient.post('/products/upsert', payload);

    if (
      response.data?.success === true ||
      response.data?.returnCode === true ||
      response.data?.productId ||
      response.data?.ProductId
    ) {
      return true;
    }
    throw new Error(response.data?.returnText || 'Update failed');
  } catch (error: any) {
    console.error('Update product error:', error);
    toast.error('Update Failed', {
      description: error.response?.data?.returnText || error.message || 'Please try again',
    });
    return false;
  }
};

// ============================================
// UPSERT PRODUCT PICTURES
// ============================================

export interface UpsertImageItem {
  file: File | string; // File for new, URL string for existing
  isMain: boolean;
  isExisting: boolean;
}

export const upsertProductPictures = async (
  productId: number,
  createdByUid: number,
  images: UpsertImageItem[]
): Promise<boolean> => {
  try {
    if (images.length === 0) {
      toast.error('At least 1 image is required');
      return false;
    }

    const formData = new FormData();
    formData.append('ProductId', productId.toString());
    formData.append('CreatedByUid', createdByUid.toString());
    formData.append('Title', '');

    let formIndex = 0;
    for (let i = 0; i < images.length; i++) {
      const img = images[i];

      if (img.isExisting && typeof img.file === 'string') {
        try {
          const src = img.file.trim();
          const proxyUrl =
            typeof window !== 'undefined'
              ? `${window.location.origin}/api/proxy-image?url=${encodeURIComponent(src)}`
              : src;
          const resp = await fetch(proxyUrl);
          if (!resp.ok) throw new Error(String(resp.status));
          const blob = await resp.blob();
          const ext = blob.type.includes('png') ? 'png' : blob.type.includes('webp') ? 'webp' : 'jpg';
          const file = new File([blob], `existing_${formIndex}.${ext}`, { type: blob.type || 'image/jpeg' });
          formData.append(`Images[${formIndex}].file`, file);
        } catch {
          console.warn('Failed to load existing image:', img.file);
          continue;
        }
      } else if (img.file instanceof File) {
        formData.append(`Images[${formIndex}].file`, img.file);
      } else {
        continue;
      }

      formData.append(`Images[${formIndex}].isMain`, img.isMain ? 'true' : 'false');
      formIndex += 1;
    }

    if (formIndex === 0) {
      toast.error('No images could be prepared for upload');
      return false;
    }

    const response = await apiClient.post('/product-pictures/upsert', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });

    return (
      response.data?.success === true ||
      response.data?.returnCode === true ||
      response.status === 200
    );
  } catch (error: any) {
    console.error('Upsert pictures error:', error);
    toast.error('Image Update Failed', {
      description: error.response?.data?.message || 'Failed to update images',
    });
    return false;
  }
};