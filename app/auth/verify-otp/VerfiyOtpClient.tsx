'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import {
  isPhoneIdentifier,
  sendIdentifierOtp,
  verifyForgotOtp,
  verifyIdentifierOtp,
} from '@/src/api/services/AuthApi';
import { ROUTES, VALIDATION } from '@/src/utils/constants';
import OtpCodeInput from '@/src/components/auth/OtpCodeInput';

export default function VerifyOtpClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const identifier = searchParams.get('email') || searchParams.get('identifier') || '';
  const purpose = parseInt(searchParams.get('purpose') || '1');
  const [otpValue, setOtpValue] = useState('');
  const [otpResetKey, setOtpResetKey] = useState('init');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const otpExpirySeconds = isPhoneIdentifier(identifier) ? 300 : 120;

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const verifyCode = useCallback(async (code: string) => {
    if (code.length !== VALIDATION.OTP_LENGTH || isLoading) return;
    setOtpValue(code);
    setIsLoading(true);
    setError('');

    try {
      let success = false;

      if (purpose === 2) {
        // Forgot password OTP verification
        const result = await verifyForgotOtp(identifier, code, purpose);
        if (result.success && result.accessKey) {
          success = true;
          // Redirect to reset password with accessKey
          router.push(
            `${ROUTES.RESET_PASSWORD}?identifier=${encodeURIComponent(identifier)}&accessKey=${encodeURIComponent(
              result.accessKey
            )}`
          );
        } else {
          setError(result.message || 'OTP verification failed');
        }
      } else {
        // General OTP verification (email/mobile)
        const result = await verifyIdentifierOtp(identifier, code, purpose);
        success = result.success;
        if (success) {
          router.push(ROUTES.HOME);
        } else {
          setError('Invalid OTP. Please check and try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [identifier, isLoading, purpose, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await verifyCode(otpValue);
  };

  const emailExpireMinutes = 2;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendOtp = async () => {
    try {
      const expireMinutes = isPhoneIdentifier(identifier) ? 5 : emailExpireMinutes;
      const result = await sendIdentifierOtp(identifier, purpose, 0, expireMinutes);
      const success = result.success;
      if (success) {
        setResendCountdown(otpExpirySeconds);
        setOtpValue('');
        setOtpResetKey(`${Date.now()}`);
        setError('');
      }
    } catch (err) {
      setError('Failed to resend OTP. Please try again.');
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
            <div className="flex items-center justify-center gap-3 mb-2">
              <Image
                src="/logo/logomain.jpg"
                alt="UDealZone"
                width={32}
                height={32}
                className="h-8 w-8 rounded object-cover"
              />
              <h1 className="text-2xl font-bold text-gray-900">Verify OTP</h1>
            </div>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to<br />
              <strong>{identifier}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <OtpCodeInput
              resetKey={otpResetKey}
              disabled={isLoading}
              error={error}
              onChange={setOtpValue}
              onComplete={verifyCode}
            />

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || otpValue.length !== VALIDATION.OTP_LENGTH}
              className="w-full py-2.5 gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </motion.button>
          </form>

          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              className="text-[#F97316] hover:text-[#d97706] font-medium transition-colors disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0
                ? `Resend in ${formatCountdown(resendCountdown)}`
                : 'Resend OTP'}
            </button>
          </div>

          {/* Back */}
          <div className="mt-6">
            <Link
              href={ROUTES.LOGIN}
              className="flex items-center justify-center gap-2 text-[#003049] hover:text-[#004d6d] font-medium transition-colors"
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
