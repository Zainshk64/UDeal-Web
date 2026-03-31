/**
 * Web Storage Utility for UDealZone
 * Handles secure token and user data persistence
 */
// src/utils/storage.ts
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'udealzone_access_token',
  REFRESH_TOKEN: 'udealzone_refresh_token',
  USER_DATA: 'udealzone_user_data',
  CITIES_CACHE: 'udealzone_cities_cache',
} as const;

type StorageKey = keyof typeof STORAGE_KEYS;
const AUTH_STORAGE_EVENT = 'udealzone-auth-storage-changed';

const emitStorageUpdate = (): void => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(AUTH_STORAGE_EVENT));
};

/**
 * Get value from localStorage
 */
export const getFromStorage = (key: StorageKey): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem(STORAGE_KEYS[key]);
  } catch (error) {
    console.error(`Error reading from storage [${key}]:`, error);
    return null;
  }
};

/**
 * Get JSON value from localStorage
 */
export const getFromStorageJSON = (key: StorageKey): any => {
  const value = getFromStorage(key);
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(`Error parsing JSON from storage [${key}]:`, error);
    return null;
  }
};

/**
 * Set value in localStorage
 */
export const setInStorage = (key: StorageKey, value: string): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEYS[key], value);
    emitStorageUpdate();
  } catch (error) {
    console.error(`Error writing to storage [${key}]:`, error);
  }
};

/**
 * Set JSON value in localStorage
 */
export const setInStorageJSON = (key: StorageKey, value: any): void => {
  try {
    setInStorage(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error stringifying JSON for storage [${key}]:`, error);
  }
};

/**
 * Remove value from localStorage
 */
export const removeFromStorage = (key: StorageKey): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEYS[key]);
    emitStorageUpdate();
  } catch (error) {
    console.error(`Error removing from storage [${key}]:`, error);
  }
};

/**
 * Clear all UDealZone data from localStorage
 */
export const clearAllStorage = (): void => {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key);
    });
    emitStorageUpdate();
  } catch (error) {
    console.error('Error clearing storage:', error);
  }
};

// ============================================
// AUTH TOKEN HELPERS
// ============================================

export const setStoredToken = (token: string, type: 'access' | 'refresh' = 'access'): void => {
  const key = type === 'access' ? 'ACCESS_TOKEN' : 'REFRESH_TOKEN';
  setInStorage(key as StorageKey, token);
};

export const getStoredToken = (type: 'access' | 'refresh' = 'access'): string | null => {
  const key = type === 'access' ? 'ACCESS_TOKEN' : 'REFRESH_TOKEN';
  return getFromStorage(key as StorageKey);
};

export const removeAuthTokens = (): void => {
  removeFromStorage('ACCESS_TOKEN');
  removeFromStorage('USER_DATA');
  removeFromStorage('REFRESH_TOKEN');
};

// ============================================
// USER DATA HELPERS
// ============================================

export interface StoredUserData {
  userId?: number;
  email?: string;
  fullName?: string;
  name?: string;
  mobNumber?: string;
  imageurl?: string;
  cityName?: string;
  cityId?: number;
  userType?: string;
  promocode?: string;
  totalReferrals?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export const setUserData = (userData: StoredUserData): void => {
  setInStorageJSON('USER_DATA', userData);
};

export const getUserData = (): StoredUserData | null => {
  return getFromStorageJSON('USER_DATA');
};

export const removeUserData = (): void => {
  removeFromStorage('USER_DATA');
};

export const updateUserData = (updates: Partial<StoredUserData>): void => {
  const current = getUserData() || {};
  setUserData({ ...current, ...updates });
};

// ============================================
// CACHE HELPERS
// ============================================

export const setCitiesCache = (cities: any[]): void => {
  setInStorageJSON('CITIES_CACHE', {
    data: cities,
    timestamp: Date.now(),
  });
};

export const getCitiesCache = (maxAge: number = 3600000): any[] | null => {
  const cached = getFromStorageJSON('CITIES_CACHE');
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > maxAge) {
    removeFromStorage('CITIES_CACHE');
    return null;
  }
  
  return cached.data;
};

// ============================================
// AUTH STATE HELPER
// ============================================

export const isAuthenticated = (): boolean => {
  const token = getStoredToken('access');
  return !!token;
};

export const clearAuthSession = (): void => {
  removeAuthTokens();
  removeUserData();
  removeFromStorage('CITIES_CACHE');
  clearAllStorage();
};
