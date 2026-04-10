'use client';

import React, { useCallback, useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiMapPin, FiSmartphone } from 'react-icons/fi';
import {
  signup,
  getCities,
  validatePromoCode,
  isEmailIdentifier,
  isPhoneIdentifier,
  sendIdentifierOtp,
  verifyIdentifierOtp,
  signInWithGoogleWeb,
} from '@/src/api/services/AuthApi';
import { ROUTES, VALIDATION } from '@/src/utils/constants';
import { validateEmail, validatePasswordStrength } from '@/src/utils/format';
import { useAuth } from '@/src/context/AuthContext';
import OtpCodeInput from '@/src/components/auth/OtpCodeInput';
import PakistanPhoneInput from '@/src/components/auth/PakistanPhoneInput';
import { toast } from 'sonner';

interface City {
  cityId: number;
  cityName: string;
}

export default function SignupClient() {
  const router = useRouter();
  const { refreshAuth } = useAuth();
  const [step, setStep] = useState<'identifier' | 'otp' | 'details'>('identifier');
  const [identifierMode, setIdentifierMode] = useState<'email' | 'phone'>('email');
  const [identifierInput, setIdentifierInput] = useState('');
  const [normalizedIdentifier, setNormalizedIdentifier] = useState('');
  const [otpIdentifierType, setOtpIdentifierType] = useState<'email' | 'phone'>('email');
  const [otpValue, setOtpValue] = useState('');
  const [otpResetKey, setOtpResetKey] = useState('init');
  const [otpError, setOtpError] = useState('');
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const getOtpCountdownSeconds = (type: 'email' | 'phone') => (type === 'phone' ? 300 : 120);

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cityId, setCityId] = useState<number>(0);
  const [promoCode, setPromoCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [cities, setCities] = useState<City[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isCitiesLoading, setIsCitiesLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'fair' | 'good' | 'strong'>('weak');

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  // Load cities on mount
  useEffect(() => {
    const loadCities = async () => {
      try {
        const citiesData = await getCities();
        setCities(citiesData);
        if (citiesData.length > 0) {
          setCityId(citiesData[0].cityId);
        }
      } finally {
        setIsCitiesLoading(false);
      }
    };

    loadCities();
  }, []);

  const identifierLabel = useMemo(
    () => (identifierMode === 'email' ? 'Email Address' : 'Mobile Number'),
    [identifierMode]
  );

  const validateIdentifier = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!identifierInput.trim()) {
      newErrors.identifier = `${identifierLabel} is required`;
    } else if (identifierMode === 'email' && !isEmailIdentifier(identifierInput)) {
      newErrors.identifier = 'Please enter a valid email';
    } else if (identifierMode === 'phone' && !isPhoneIdentifier(identifierInput)) {
      newErrors.identifier = 'Use Pakistani mobile format 3XXXXXXXXX';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateDetailsForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Full Name
    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (fullName.trim().length < VALIDATION.NAME_MIN_LENGTH) {
      newErrors.fullName = `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required for your account';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // City
    if (!cityId) {
      newErrors.cityId = 'Please select a city';
    }

    // Password
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
      newErrors.password = `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
    }

    // Confirm Password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value) {
      const { strength } = validatePasswordStrength(value);
      setPasswordStrength(strength);
    }
    if (errors.password) setErrors({ ...errors, password: '' });
  };

  const handleSendOtp = async () => {
    if (!validateIdentifier()) return;
    setIsLoading(true);
    try {
      const expireMinutes = identifierMode === 'phone' ? 5 : 2;
      const result = await sendIdentifierOtp(identifierInput, 1, 0, expireMinutes);
      if (!result.success) return;
      setNormalizedIdentifier(result.normalizedIdentifier);
      setOtpIdentifierType(result.type);
      setOtpValue('');
      setOtpError('');
      setOtpResetKey(`${Date.now()}`);
      if (result.type === 'email') {
        setEmail(result.normalizedIdentifier);
      }
      setResendCountdown(getOtpCountdownSeconds(result.type));
      setStep('otp');
    } finally {
      setIsLoading(false);
    }
  };

  const verifyAndContinue = useCallback(
    async (otp: string) => {
      if (otp.length !== VALIDATION.OTP_LENGTH || isVerifyingOtp) return;
      setOtpValue(otp);
      setOtpError('');
      setIsVerifyingOtp(true);
      try {
        const result = await verifyIdentifierOtp(normalizedIdentifier || identifierInput, otp, 1);
        if (!result.success) {
          setOtpError('Invalid OTP. Please check and try again.');
          return;
        }
        if (result.type === 'email') {
          setEmail(result.normalizedIdentifier);
        }
        setStep('details');
      } finally {
        setIsVerifyingOtp(false);
      }
    },
    [identifierInput, isVerifyingOtp, normalizedIdentifier]
  );

  const handleResendOtp = async () => {
    if (resendCountdown > 0) return;
    const expireMinutes = otpIdentifierType === 'phone' ? 5 : 2;
    const result = await sendIdentifierOtp(normalizedIdentifier || identifierInput, 1, 0, expireMinutes);
    if (result.success) {
      setOtpIdentifierType(result.type);
      setResendCountdown(getOtpCountdownSeconds(result.type));
      setOtpResetKey(`${Date.now()}`);
      setOtpValue('');
      setOtpError('');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateDetailsForm()) return;

    setIsLoading(true);
    try {
      // Validate promo code if provided
      if (promoCode.trim()) {
        const isValidPromo = await validatePromoCode(promoCode);
        if (!isValidPromo) {
          setErrors({ promoCode: 'Invalid promo code' });
          setIsLoading(false);
          return;
        }
      }

      const success = await signup(
        fullName,
        normalizedIdentifier || identifierInput,
        email,
        password,
        cityId,
        promoCode
      );

      if (success) {
        router.push(`${ROUTES.LOGIN}?identifier=${encodeURIComponent(normalizedIdentifier || email)}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsGoogleLoading(true);
    try {
      const data = await signInWithGoogleWeb();
      if (data) {
        refreshAuth();
        router.push(ROUTES.HOME);
      }
    } catch (error: any) {
      toast.error('Google signup failed', {
        description: error?.message || 'Please try again.',
      });
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 'weak':
        return 'bg-red-500';
      case 'fair':
        return 'bg-yellow-500';
      case 'good':
        return 'bg-blue-500';
      case 'strong':
        return 'bg-green-500';
    }
  };

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4 py-8">
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
            <p className="text-gray-600">Create your account and start selling</p>
          </div>

          {step === 'identifier' && (
            <div className="mb-6 grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setIdentifierMode('email');
                  setIdentifierInput('');
                  setErrors({});
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  identifierMode === 'email' ? 'bg-white text-[#003049] shadow' : 'text-gray-600'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setIdentifierMode('phone');
                  setIdentifierInput('');
                  setErrors({});
                }}
                className={`rounded-md px-3 py-2 text-sm font-medium ${
                  identifierMode === 'phone' ? 'bg-white text-[#003049] shadow' : 'text-gray-600'
                }`}
              >
                Mobile
              </button>
            </div>
          )}

          {(step === 'identifier' || step === 'details') && (
            <form onSubmit={step === 'identifier' ? (e) => { e.preventDefault(); handleSendOtp(); } : handleSignupSubmit} className="space-y-4">
              {step === 'identifier' && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">{identifierLabel}</label>
                  {identifierMode === 'email' ? (
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        value={identifierInput}
                        onChange={(e) => {
                          setIdentifierInput(e.target.value);
                          if (errors.identifier) setErrors({ ...errors, identifier: '' });
                        }}
                        className={`w-full rounded-lg border py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#F97316] ${
                          errors.identifier ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="your@email.com"
                      />
                    </div>
                  ) : (
                    <PakistanPhoneInput
                      value={identifierInput}
                      onChange={(next) => {
                        setIdentifierInput(next);
                        if (errors.identifier) setErrors({ ...errors, identifier: '' });
                      }}
                      error={errors.identifier}
                    />
                  )}
                  {identifierMode === 'email' && errors.identifier ? (
                    <p className="mt-1 text-sm text-red-500">{errors.identifier}</p>
                  ) : null}
                </div>
              )}

              {step === 'details' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <FiUser className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (errors.fullName) setErrors({ ...errors, fullName: '' });
                        }}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                          errors.fullName ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="John Doe"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        value={email}
                        readOnly={identifierMode === 'email'}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors({ ...errors, email: '' });
                        }}
                        className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                          errors.email ? 'border-red-500' : 'border-gray-300'
                        } ${identifierMode === 'email' ? 'bg-gray-100' : ''}`}
                        placeholder="your@email.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>
                </>
              )}
              {step === 'details' && (
                <>
                  {/* City Selection */}
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <div className="relative">
                <FiMapPin className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                {isCitiesLoading ? (
                  <div className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100">
                    Loading cities...
                  </div>
                ) : (
                  <select
                    value={cityId}
                    onChange={(e) => {
                      setCityId(Number(e.target.value));
                      if (errors.cityId) setErrors({ ...errors, cityId: '' });
                    }}
                    className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors appearance-none bg-white ${
                      errors.cityId ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value={0}>Select a city</option>
                    {cities.map((city) => (
                      <option key={city.cityId} value={city.cityId}>
                        {city.cityName}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              {errors.cityId && (
                <p className="text-red-500 text-sm mt-1">{errors.cityId}</p>
              )}
                  </div>

                  {/* Password */}
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={handlePasswordChange}
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
              {password && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getPasswordStrengthColor()} transition-all duration-300`}
                      style={{
                        width: passwordStrength === 'weak' ? '25%' :
                               passwordStrength === 'fair' ? '50%' :
                               passwordStrength === 'good' ? '75%' : '100%'
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Password strength: <span className="font-semibold capitalize">{passwordStrength}</span>
                  </p>
                </div>
              )}
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
                  </div>

                  {/* Confirm Password */}
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="w-5 h-5" />
                  ) : (
                    <FiEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
              )}
                  </div>

                  {/* Promo Code */}
                  <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promo Code <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <input
                type="text"
                value={promoCode}
                onChange={(e) => {
                  setPromoCode(e.target.value);
                  if (errors.promoCode) setErrors({ ...errors, promoCode: '' });
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F97316] transition-colors ${
                  errors.promoCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="SAVE10"
              />
              {errors.promoCode && (
                <p className="text-red-500 text-sm mt-1">{errors.promoCode}</p>
              )}
                  </div>
                </>
              )}

              {/* Submit Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="mt-6 w-full rounded-lg py-2.5 font-semibold text-white gradient-accent transition-shadow hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading
                  ? step === 'identifier'
                    ? 'Sending OTP...'
                    : 'Creating Account...'
                  : step === 'identifier'
                  ? 'Send OTP'
                  : 'Create Account'}
              </motion.button>
            </form>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-center text-sm text-gray-600">
                Enter the 6-digit OTP sent to <strong>{normalizedIdentifier || identifierInput}</strong>
              </p>
              <OtpCodeInput
                resetKey={otpResetKey}
                error={otpError}
                disabled={isVerifyingOtp}
                onChange={setOtpValue}
                onComplete={verifyAndContinue}
              />
              <button
                type="button"
                disabled={isVerifyingOtp || otpValue.length !== VALIDATION.OTP_LENGTH}
                onClick={() => verifyAndContinue(otpValue)}
                className="w-full rounded-lg bg-[#003049] py-2.5 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={resendCountdown > 0}
                className="w-full text-sm font-medium text-[#F97316] disabled:text-gray-400"
              >
                {resendCountdown > 0
                  ? `Resend ${otpIdentifierType === 'phone' ? 'mobile' : 'email'} OTP in ${formatCountdown(resendCountdown)}`
                  : 'Resend OTP'}
              </button>
              <button
                type="button"
                onClick={() => setStep('identifier')}
                className="w-full text-sm text-gray-600"
              >
                Edit identifier
              </button>
            </div>
          )}

          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="text-sm text-gray-500">or</span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleLoading}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSmartphone className="h-4 w-4" />
            {isGoogleLoading ? 'Connecting Google...' : 'Continue with Google'}
          </button>

          {/* Login Link */}
          <p className="text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              href={ROUTES.LOGIN}
              className="text-[#F97316] hover:text-[#d97706] font-semibold transition-colors"
            >
              Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
