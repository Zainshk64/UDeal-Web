import apiClient from './api';
import {
  setStoredToken,
  setUserData,
  removeAuthTokens,
  getStoredToken,
  setCitiesCache,
} from '@/src/utils/storage';
import { toast } from 'sonner';

// ============================================
// TYPES
// ============================================

export interface AuthResponse {
  returnCode: boolean;
  returnText: string;
  cityId?: number | null;
  fullName?: string;
  name?: string;
  cityName?: string;
  userType?: string;
  userId?: number | null;
  userPromoCode?: string;
  promocode?: string;
  accessToken?: string | null;
  refreshToken?: string | null;
}

export interface SignupResponse {
  returnCode: boolean;
  returnText: string;
  accessToken?: string | null;
  refreshToken?: string | null;
  userId?: number;
}

export interface OtpResponse {
  returnCode: boolean;
  returnText: string;
}

export interface VerifyForgotOtpResponse {
  returnCode: boolean;
  returnText: string;
  accessKey?: string;
}

export interface ResetPasswordResponse {
  returnCode: boolean;
  returnText: string;
}

export interface ChangePasswordResponse {
  returnCode: boolean;
  returnText: string;
  accessKey?: string | null;
}

// ============================================
// SEND OTP
// ============================================

export const sendOtp = async (
  identifier: string,
  purpose: number = 1,
  userId: number = 0,
  expireMinutes: number = 5
): Promise<boolean> => {
  try {
    const response = await apiClient.post<OtpResponse>('/otp/send', {
      email: identifier,
      purpose,
      userId,
      expireMinutes,
    });

    if (response.data.returnCode) {
      toast.success('OTP sent successfully!', {
        description: response.data.returnText || 'Check your email for the OTP.',
      });
      return true;
    } else {
      toast.error('Failed to send OTP', {
        description: response.data.returnText || 'Please try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || error.message || 'Network error';
    toast.error('Error sending OTP', { description: msg });
    console.error('Send OTP error:', error);
    return false;
  }
};

// ============================================
// VERIFY OTP
// ============================================

export const verifyOtp = async (
  identifier: string,
  otp: string,
  purpose: number = 1,
  userId: number = 0
): Promise<boolean> => {
  try {
    const response = await apiClient.post<OtpResponse>('/otp/verifyOTP', {
      email: identifier,
      purpose,
      userId,
      otp,
    });

    if (response.data.returnCode) {
      toast.success('OTP verified successfully!');
      return true;
    } else {
      toast.error('Invalid OTP', {
        description: response.data.returnText || 'Please check and try again.',
      });
      return false;
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || error.message || 'Network error';
    toast.error('Verification failed', { description: msg });
    console.error('Verify OTP error:', error);
    return false;
  }
};

// ============================================
// FORGOT PASSWORD - VERIFY OTP
// ============================================

export const verifyForgotOtp = async (
  identifier: string,
  otp: string,
  purpose: number = 2,
  userId: number = 0
): Promise<{ success: boolean; accessKey?: string; message?: string }> => {
  try {
    const response = await apiClient.post<VerifyForgotOtpResponse>(
      '/otp/VerifyForgotPasswordOtp',
      {
        email: identifier,
        purpose,
        userId,
        otp,
      }
    );

    if (response.data.returnCode) {
      toast.success('OTP verified!');
      return {
        success: true,
        accessKey: response.data.accessKey,
        message: response.data.returnText,
      };
    } else {
      toast.error('Invalid OTP', {
        description: response.data.returnText || 'Verification failed.',
      });
      return {
        success: false,
        message: response.data.returnText,
      };
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || error.message || 'Network error';
    toast.error('Error', { description: msg });
    console.error('Verify forgot OTP error:', error);
    return { success: false, message: msg };
  }
};

// ============================================
// RESET PASSWORD
// ============================================

export const resetPassword = async (
  email: string,
  accessKey: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<ResetPasswordResponse>(
      '/auth/ForgotPassword',
      {
        email,
        accessKey,
        newPassword,
      }
    );

    if (response.data.returnCode) {
      toast.success('Password reset successfully!');
      return {
        success: true,
        message: response.data.returnText || 'Your password has been reset.',
      };
    } else {
      toast.error('Reset failed', {
        description: response.data.returnText || 'Please try again.',
      });
      return {
        success: false,
        message: response.data.returnText || 'Failed to reset password',
      };
    }
  } catch (error: any) {
    const msg = error.response?.data?.returnText || error.message || 'Network error';
    toast.error('Error', { description: msg });
    console.error('Reset password error:', error);
    return { success: false, message: msg };
  }
};

// ============================================
// LOGIN
// ============================================

export const login = async (email: string, password: string): Promise<boolean> => {
  try {
    const response = await apiClient.post<AuthResponse>('/auth/login', {
      email,
      password,
    });

    if (response.data.returnCode && response.data.accessToken) {
      // Save tokens
      setStoredToken(response.data.accessToken, 'access');
      if (response.data.refreshToken) {
        setStoredToken(response.data.refreshToken, 'refresh');
      }

      // Save user data
      setUserData({
        userId: response.data.userId,
        email,
        fullName: response.data.fullName,
        name: response.data.name || response.data.fullName,
        cityName: response.data.cityName,
        cityId: response.data.cityId,
        userType: response.data.userType,
        promocode: response.data.promocode,
      });

      const firstName = response.data.fullName?.split(' ')[0] || 'User';
      toast.success(`Welcome back, ${firstName}!`, {
        description: 'You are now logged in successfully.',
      });

      return true;
    } else {
      toast.error('Login failed', {
        description: response.data.returnText || 'Invalid email or password.',
      });
      return false;
    }
  } catch (error: any) {
    let errorMessage = 'Please check your connection and try again.';
    if (error.response?.data?.returnText) {
      errorMessage = error.response.data.returnText;
    } else if (error.message) {
      errorMessage = error.message;
    }

    toast.error('Unable to login', { description: errorMessage });
    console.error('Login error:', error);
    return false;
  }
};

// ============================================
// SIGNUP
// ============================================

export const signup = async (
  fullName: string,
  email: string,
  password: string,
  cityId: number,
  userPromoCode: string = ''
): Promise<boolean> => {
  try {
    const response = await apiClient.post<SignupResponse>('/auth/signup', {
      fullName,
      email,
      password,
      cityId,
      userPromoCode,
    });

    if (response.data.returnCode) {
      // Save tokens if they exist
      if (response.data.accessToken) {
        setStoredToken(response.data.accessToken, 'access');
      }
      if (response.data.refreshToken) {
        setStoredToken(response.data.refreshToken, 'refresh');
      }

      // Save user data
      setUserData({
        fullName,
        email,
        cityId,
        userId: response.data.userId,
      });

      toast.success('Account created successfully!', {
        description: response.data.returnText || 'Welcome to UDealZone!',
      });

      return true;
    } else {
      toast.error('Signup failed', {
        description: response.data.returnText || 'Please check your details and try again.',
      });
      return false;
    }
  } catch (error: any) {
    let errorMessage = error.response?.data?.returnText || error.message || 'Network error';
    toast.error('Unable to sign up', { description: errorMessage });
    console.error('Signup error:', error);
    return false;
  }
};

// ============================================
// VALIDATE PROMO CODE
// ============================================

export const validatePromoCode = async (promocode: string): Promise<boolean> => {
  if (!promocode.trim()) return true; // Empty = valid (optional)
  try {
    const response = await apiClient.post(
      `/Default/ValidatePromocode?promocode=${promocode.trim()}`,
      {}
    );
    return response.data === true || response.data?.returnCode === true;
  } catch (error) {
    console.error('Promo code validation error:', error);
    return false;
  }
};

// ============================================
// GET CITIES
// ============================================

export const getCities = async (): Promise<
  { cityId: number; cityName: string }[]
> => {
  try {
    const response = await apiClient.get('/Default/cities');
    const cities = response.data;
    
    // Cache cities
    if (Array.isArray(cities)) {
      setCitiesCache(cities);
    }
    
    return cities;
  } catch (error) {
    toast.error('Error', { description: 'Failed to load cities' });
    console.error('Get cities error:', error);
    return [];
  }
};

// ============================================
// CHANGE PASSWORD
// ============================================

export const changePassword = async (
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await apiClient.post<ChangePasswordResponse>('/auth/ChangePassword', {
      userId,
      currentPassword,
      newPassword,
    });

    if (response.data.returnCode) {
      toast.success('Password changed successfully!');
      return {
        success: true,
        message: response.data.returnText || 'Your password has been updated.',
      };
    } else {
      toast.error('Failed to change password', {
        description: response.data.returnText || 'Please check your current password.',
      });
      return {
        success: false,
        message: response.data.returnText || 'Failed to change password',
      };
    }
  } catch (error: any) {
    const msg =
      error.response?.data?.returnText ||
      error.message ||
      'Network error. Please try again.';
    toast.error('Error', { description: msg });
    console.error('Change password error:', error);
    return { success: false, message: msg };
  }
};

// ============================================
// LOGOUT
// ============================================

export const logout = async (): Promise<void> => {
  try {
    const refreshToken = getStoredToken('refresh');
    if (refreshToken) {
      await apiClient.post('/auth/logout', { refreshToken });
    }
  } catch (error) {
    console.error('Logout API error:', error);
  } finally {
    // Clear all auth data regardless of API response
    removeAuthTokens();
    toast.success('Goodbye!', { description: 'Logged out successfully' });
  }
};

// ============================================
// GOOGLE AUTH (STRUCTURE)
// ============================================

export const signInWithGoogleBackend = async (
  googleUser: {
    email: string;
    name: string;
    id: string;
  },
  phone: string,
  cityId: number,
  gender: string
): Promise<any> => {
  try {
    const response = await apiClient.post('/auth/SignInWithGoogle', {
      email: googleUser.email,
      name: googleUser.name,
      phone,
      cityId,
      gender,
    });

    if (response.data.accessToken) {
      setStoredToken(response.data.accessToken, 'access');
      if (response.data.refreshToken) {
        setStoredToken(response.data.refreshToken, 'refresh');
      }

      setUserData({
        email: googleUser.email,
        fullName: googleUser.name,
        cityId,
      });

      toast.success('Google login successful!');
      return response.data;
    }

    return null;
  } catch (error: any) {
    toast.error('Google login failed', {
      description: 'Please try again or use email login.',
    });
    console.error('Google login error:', error);
    return null;
  }
};
