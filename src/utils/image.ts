/**
 * Image URL Helper for UDealZone
 * Constructs proper image URLs for products
 */

const DEFAULT_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=No+Image';
const CDN_BASE = 'https://udealzone.com/Members';

/**
 * Get proper image URL for product
 */
export const getImageUrl = (path: string | null): string => {
  if (!path) {
    return DEFAULT_PLACEHOLDER;
  }

  // If already a full URL, return as is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  // Construct CDN URL
  return `${CDN_BASE}/${cleanPath}`;
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

  // If it's a CDN URL, we can add query params
  if (baseUrl.includes(CDN_BASE)) {
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    return `${baseUrl}?${params.toString()}`;
  }

  return baseUrl;
};
