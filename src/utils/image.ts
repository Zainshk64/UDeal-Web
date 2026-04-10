/**
 * Image URL Helper for UDealZone
 * Constructs proper image URLs for products
 */

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image';

/** Site base for relative upload paths from API (handles with or without leading slash). */
const MEMBERS_BASE = 'https://udealzone.com/Members';

/**
 * Normalize any API image path to a full URL.
 * - Full http(s) URLs (e.g. Google avatars): returned unchanged.
 * - Relative paths: `Uploads/...`, `/Uploads/...`, `Members/...` → single canonical URL under udealzone.com/Members.
 */
export const getImageUrl = (path: string | null | undefined): string => {
  if (path == null || String(path).trim() === '') {
    return DEFAULT_PLACEHOLDER;
  }

  const p = String(path).trim();

  if (p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }

  const clean = p.replace(/^\/+/, '');

  if (clean.startsWith('Members/')) {
    return `https://udealzone.com/${clean}`;
  }

  return `${MEMBERS_BASE}/${clean}`;
};

/**
 * Get image URL with fallback
 */
export const getImageUrlWithFallback = (path: string | null, fallback: string = DEFAULT_PLACEHOLDER): string => {
  const url = getImageUrl(path);
  return url || fallback;
};

/**
 * Check if image URL is valid
 */
export const isValidImageUrl = (url: string | null): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Preload image to check if it loads
 */
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
    img.src = url;
  });
};

/**
 * Get optimized image URL with size parameters
 */
export const getOptimizedImageUrl = (
  path: string | null,
  width?: number,
  height?: number
): string => {
  const baseUrl = getImageUrl(path);
  
  if (!width && !height) {
    return baseUrl;
  }

  // If it's a site CDN URL, we can add query params
  if (baseUrl.includes('udealzone.com/Members')) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
};
