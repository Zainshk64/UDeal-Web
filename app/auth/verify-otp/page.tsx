'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiArrowLeft } from 'react-icons/fi';
import { verifyOtp, sendOtp, verifyForgotOtp } from '@/src/api/services/AuthApi';
import { ROUTES, VALIDATION } from '@/src/utils/constants';

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const purpose = parseInt(searchParams.get('purpose') || '1');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCountdown, setResendCountdown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Only allow digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const otpValue = otp.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otpValue.length !== VALIDATION.OTP_LENGTH) {
      setError('Please enter a complete OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let success = false;

      if (purpose === 2) {
        // Forgot password OTP verification
        const result = await verifyForgotOtp(email, otpValue, purpose);
        if (result.success && result.accessKey) {
          success = true;
          // Redirect to reset password with accessKey
          router.push(
            `${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}&accessKey=${encodeURIComponent(
              result.accessKey
            )}`
          );
        } else {
          setError(result.message || 'OTP verification failed');
        }
      } else {
        // Signup OTP verification
        success = await verifyOtp(email, otpValue, purpose);
        if (success) {
          router.push(ROUTES.HOME);
        } else {
          setError('Invalid OTP. Please check and try again.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      const success = await sendOtp(email, purpose);
      if (success) {
        setResendCountdown(60);
        setOtp(['', '', '', '', '', '']);
        setError('');
        inputRefs.current[0]?.focus();
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-gray-600 text-sm">
              We've sent a 6-digit code to<br />
              <strong>{email}</strong>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:border-[#F97316] transition-colors"
                  whileFocus={{ scale: 1.05 }}
                />
              ))}
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading || otpValue.length !== VALIDATION.OTP_LENGTH}
              className="w-full py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
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
                ? `Resend in ${resendCountdown}s`
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
