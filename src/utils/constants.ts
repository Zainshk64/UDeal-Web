/**
 * UDealZone Constants
 */

// ============================================
// CATEGORIES
// ============================================

export const CATEGORIES = [
  {
    id: 1,
    name: 'Vehicles',
    image: '/Category/car-new.png',
    color: '#003049',
  },
  {
    id: 2,
    name: 'Bikes',
    image: '/Category/Bike.png',
    icon: '🏍️',
    color: '#004d6d',
  },
  {
    id: 3,
    name: 'Property Sale',
    image: '/Category/PropertyforSale.png',
    icon: '🏠',
    color: '#F97316',
  },
  {
    id: 4,
    name: 'Property Rent',
    image: '/Category/PropertyforRent.png',
    icon: '🏘️',
    color: '#facc15',
  },
  {
    id: 5,
    name: 'Mobiles',
    image: '/Category/mobiles.png',
    icon: '📱',
    color: '#003049',
  },
  {
    id: 6,
    name: 'Electronics',
    image: '/Category/electronics.png',
    icon: '📺',
    color: '#004d6d',
  },
  {
    id: 7,
    name: 'Furniture',
    image: '/Category/furniture.png',
    icon: '🪑',
    color: '#F97316',
  },
  {
    id: 8,
    name: 'Animals',
    image: '/Category/animals.png',
    icon: '🐕',
    color: '#facc15',
  },
  {
    id: 9,
    name: 'Fashion',
    image: '/Category/Fashion.png',
    icon: '👗',
    color: '#003049',
  },
  {
    id: 10,
    name: 'Services',
    image: '/Category/services.png',
    icon: '🔧',
    color: '#004d6d',
  },
] as const;

// ============================================
// ROUTES
// ============================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  FORGOT_PASSWORD: '/auth/forgot-password',
  VERIFY_OTP: '/auth/verify-otp',
  RESET_PASSWORD: '/auth/reset-password',
  MY_ADS: '/my-ads',
  ADD_POST: '/add-post',
  PRODUCT_DETAIL: '/product',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// ============================================
// API ENDPOINTS
// ============================================

export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  SIGNUP: '/auth/signup',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  CHANGE_PASSWORD: '/auth/ChangePassword',
  
  // OTP
  SEND_OTP: '/otp/send',
  VERIFY_OTP: '/otp/verifyOTP',
  VERIFY_FORGOT_OTP: '/otp/VerifyForgotPasswordOtp',
  FORGOT_PASSWORD: '/auth/ForgotPassword',
  
  // Home
  HOME_DEFAULT: '/Home/Home-Page-default',
  HOME_BY_CITY: '/Home/Home-Page-ByCity',
  HOME_BY_LOCATION: '/Home/Home-Page-By-Location',
  
  // Products
  PRODUCT_DETAIL: '/products/GetProductbyId',
  
  // Favorites
  TOGGLE_FAVORITE: '/ProductAction/UpsertFavorites',
  
  // My Ads
  MY_ADS: '/MyAds/GetMyAds',
  DELETE_AD: '/MyAds/DeleteProduct',
  MARK_AS_SOLD: '/MyAds/MarkAsSold',
  TOGGLE_FEATURED: '/MyAds/ToggleFeatured',
  UPDATE_AD: '/MyAds/UpdateProduct',
  
  // Categories
  CATEGORIES: '/Default/categories',
  SUBCATEGORIES: '/Default/subcategories',
  CITIES: '/Default/cities',
  VALIDATE_PROMO: '/Default/ValidatePromocode',
  
  // Chatbot
  CHAT: '/udeal-ai/chat',
  
  // Google Auth
  GOOGLE_SIGNIN: '/auth/SignInWithGoogle',
} as const;

// ============================================
// VALIDATION RULES
// ============================================

export const VALIDATION = {
  EMAIL_PATTERN: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE_PATTERN: /^[\d\s\-\+\(\)]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_MAX_LENGTH: 50,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  OTP_LENGTH: 6,
  TITLE_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 2000,
  PRICE_MAX_VALUE: 999999999,
} as const;

// ============================================
// LOCAL STORAGE KEYS
// ============================================

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'udealzone_access_token',
  REFRESH_TOKEN: 'udealzone_refresh_token',
  USER_DATA: 'udealzone_user_data',
  CITIES_CACHE: 'udealzone_cities_cache',
  CONVERSATION_ID: 'udealzone_conversation_id',
} as const;

// ============================================
// ERROR MESSAGES
// ============================================

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PASSWORD: 'Password must be at least 6 characters long.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  INVALID_OTP: 'Invalid OTP. Please check and try again.',
  REQUIRED_FIELD: 'This field is required.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
} as const;

// ============================================
// SUCCESS MESSAGES
// ============================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully.',
  SIGNUP_SUCCESS: 'Account created successfully. Welcome to UDealZone!',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PASSWORD_RESET: 'Password reset successfully. You can now login with your new password.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  AD_DELETED: 'Ad deleted successfully.',
  AD_MARKED_SOLD: 'Ad marked as sold.',
  FAVORITE_ADDED: 'Added to favorites.',
  FAVORITE_REMOVED: 'Removed from favorites.',
} as const;

// ============================================
// FEATURE FLAGS
// ============================================

export const FEATURES = {
  GOOGLE_AUTH: true,
  FACEBOOK_AUTH: false,
  LOCATION_BASED: true,
  CHATBOT: true,
  FEATURED_ADS: true,
  MESSAGING: false,
} as const;

// ============================================
// PAGINATION
// ============================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PRODUCTS_PER_CATEGORY: 4,
  MY_ADS_PAGE_SIZE: 12,
} as const;

// ============================================
// ANIMATION DURATIONS (ms)
// ============================================

export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  VERY_SLOW: 800,
} as const;
