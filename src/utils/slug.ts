export const toSlug = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

export const buildCategorySlugPath = (categoryName: string): string => {
  return `/category/${toSlug(categoryName)}`;
};

export const buildProductSlugPath = (
  productTitle: string,
  _productId?: number,
): string => {
  return `/product/${toSlug(productTitle)}`;
};