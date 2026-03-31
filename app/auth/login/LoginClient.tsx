'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiSmartphone } from 'react-icons/fi';
import { login, signInWithGoogleBackend } from '@/src/api/services/AuthApi';
import { ROUTES } from '@/src/utils/constants';
import { isEmailIdentifier, isPhoneIdentifier } from '@/src/api/services/AuthApi';
import { useAuth } from '@/src/context/AuthContext';
import { promptGoogleCredential } from '@/src/utils/googleAuth';
import { toast } from 'sonner';

export default function LoginClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { refreshAuth } = useAuth();


  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const prefill = searchParams.get('identifier');
    if (prefill) setIdentifier(prefill);
  }, [searchParams]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Email or mobile number is required';
    } else if (!isEmailIdentifier(identifier) && !isPhoneIdentifier(identifier)) {
      newErrors.identifier = 'Please enter a valid email or Pakistani mobile number';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const success = await login(identifier, password);
      if (success) {
        router.push(ROUTES.HOME);
        refreshAuth(); // Refresh auth state after successful login
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true);
    try {
      const googleUser = await promptGoogleCredential();
      const data = await signInWithGoogleBackend(googleUser);
      if (data) {
        refreshAuth();
        router.push(ROUTES.HOME);
      }
    } catch (error: any) {
      toast.error('Google login failed', {
        description: error?.message || 'Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3">
              <Image
                src="/logo/logomain.jpg"
                alt="UDealZone"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
              />
              <h1 className="text-3xl font-bold mb-2">
                <span className="text-[#003049]">UDeal</span>
                <span className="text-[#F97316]">Zone</span>
              </h1>
            </div>
            <p className="text-gray-600">Welcome back to our marketplace</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (errors.identifier) setErrors({ ...errors, identifier: '' });
                  }}
                  className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                    errors.identifier ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com or 3XXXXXXXXX"
                />
              </div>
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: '' });
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                href={ROUTES.FORGOT_PASSWORD}
                className="text-[#F97316] hover:text-[#d97706] text-sm font-medium transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 gradient-accent text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Logging in...' : 'Log In'}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleLoading}
            className="mb-6 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSmartphone className="h-4 w-4" />
            {isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}
          </button>

          {/* Sign Up Link */}
          <p className="text-center text-gray-600">
            Don't have an account?{' '}
            <Link
              href={ROUTES.SIGNUP}
              className="text-[#F97316] hover:text-[#d97706] font-semibold transition-colors"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
