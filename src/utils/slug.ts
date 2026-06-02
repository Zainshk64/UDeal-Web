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
  productId: number,
): string => {
  return `/product/${toSlug(productTitle)}-${productId}`;
};

/** Extract the numeric product ID from the trailing segment of a slug param, e.g. "iphone-12-15197" → 15197 */
export const getProductIdFromSlug = (slugParam?: string): number | undefined => {
  if (!slugParam) return undefined;
  // Legacy: pure numeric id (old links like /product/15197)
  const direct = Number(slugParam);
  if (!Number.isNaN(direct) && direct > 0) return direct;
  // Standard: slug-id e.g. iphone-12-15197
  const match = slugParam.match(/-(\d+)$/);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return !Number.isNaN(parsed) && parsed > 0 ? parsed : undefined;
};