'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiMail, FiArrowLeft, FiSmartphone } from 'react-icons/fi';
import {
  isEmailIdentifier,
  isPhoneIdentifier,
  sendIdentifierOtp,
} from '@/src/api/services/AuthApi';
import { ROUTES } from '@/src/utils/constants';

export default function ForgotPasswordClient() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedIdentifier, setSubmittedIdentifier] = useState('');

  const validateForm = (): boolean => {
    const value = identifier.trim();
    if (!value) {
      setError('Email or mobile number is required');
      return false;
    }
    if (!isEmailIdentifier(value) && !isPhoneIdentifier(value)) {
      setError('Please enter a valid email or Pakistani mobile number');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const normalized = identifier.trim();
      const expireMinutes = isPhoneIdentifier(normalized) ? 5 : 2;
      const result = await sendIdentifierOtp(normalized, 2, 0, expireMinutes);
      const success = result.success;
      if (success) {
        setSubmittedIdentifier(result.normalizedIdentifier);
        setIsSubmitted(true);
        // Redirect to verify OTP page after a delay
        setTimeout(() => {
          router.push(
            `${ROUTES.VERIFY_OTP}?identifier=${encodeURIComponent(
              result.normalizedIdentifier
            )}&purpose=2`
          );
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md"
        >
          <div className="mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
          <p className="text-gray-600 mb-6">
            We&apos;ve sent an OTP to <strong>{submittedIdentifier}</strong>. Check your inbox/SMS
            and follow the instructions to reset your password.
          </p>
          <p className="text-sm text-gray-500">Redirecting you to verify OTP...</p>
        </motion.div>
      </div>
    );
  }

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
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/logo/logomain.jpg"
                alt="UDealZone"
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
            </div>
            <p className="text-gray-600">Enter your email or mobile to receive an OTP</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Identifier Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email or Mobile
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <FiSmartphone className="absolute left-9 top-3.5 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError('');
                  }}
                  className={`w-full pl-14 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                    error ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="your@email.com or 3XXXXXXXXX"
                />
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Sending OTP...' : 'Send OTP'}
            </motion.button>
          </form>

          {/* Back to Login */}
          <div className="mt-6">
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center justify-center gap-2 text-[#F97316] hover:text-[#d97706] font-medium transition-colors"
            >
              <FiArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
