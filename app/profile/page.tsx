'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiCamera, FiCheckCircle, FiMail, FiMapPin, FiPhone, FiSave, FiUser } from 'react-icons/fi';
import PakistanPhoneInput from '@/src/components/auth/PakistanPhoneInput';
import OtpCodeInput from '@/src/components/auth/OtpCodeInput';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES, VALIDATION } from '@/src/utils/constants';
import {
  editProfile,
  getCities,
  isEmailIdentifier,
  sendIdentifierOtp,
  uploadProfileImage,
  verifyIdentifierOtp,
} from '@/src/api/services/AuthApi';
import { updateUserData } from '@/src/utils/storage';
import { getImageUrlWithFallback } from '@/src/utils/image';
import { toast } from 'sonner';

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, refreshAuth } = useAuth();

  const [name, setName] = useState(user?.name || user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phoneInput, setPhoneInput] = useState(
    user?.mobNumber ? user.mobNumber.replace(/^92/, '').replace(/^0/, '') : ''
  );
  const [cityId, setCityId] = useState<number>(user?.cityId || 0);
  const [cities, setCities] = useState<Array<{ cityId: number; cityName: string }>>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [avatarPath, setAvatarPath] = useState(user?.imageurl || '');

  const [contactError, setContactError] = useState('');

  const [otpOpen, setOtpOpen] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState('');
  const [otpType, setOtpType] = useState<'email' | 'phone'>('phone');
  const [otpResetKey, setOtpResetKey] = useState('profile-init');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    const loadCities = async () => {
      const list = await getCities();
      setCities(list);
      if (!cityId && list.length > 0) setCityId(list[0].cityId);
    };
    loadCities();
  }, [cityId]);

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setTimeout(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCountdown]);

  const storedEmail = user?.email || '';
  const storedMobNumber = user?.mobNumber || '';
  const storedPhoneInput = storedMobNumber
    ? storedMobNumber.replace(/^92/, '').replace(/^0/, '')
    : '';

  // Backend login response does not include emailVerified/phoneVerified booleans.
  // So we infer "verified" from whether the identifier exists and matches current input.
  const emailVerified = useMemo(
    () =>
      !!storedEmail &&
      email.trim().toLowerCase() === storedEmail.trim().toLowerCase(),
    [email, storedEmail]
  );
  const phoneVerified = useMemo(
    () => !!storedMobNumber && phoneInput === storedPhoneInput,
    [phoneInput, storedMobNumber, storedPhoneInput]
  );

  const emailLocked = !!storedEmail;
  const phoneLocked = !!storedMobNumber;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const pickProfileImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.userId) return;
    setIsUploadingImage(true);
    try {
      const result = await uploadProfileImage(user.userId, file);
      if (!result.success) return;
      if (result.picPath) {
        setAvatarPath(result.picPath);
        updateUserData({ imageurl: result.picPath });
        refreshAuth();
      }
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user?.userId) return;
    if (!name.trim()) {
      toast.error('Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const result = await editProfile({
        uid: user.userId,
        name: name.trim(),
        cityId,
        mobNumber: undefined,
        identifier: undefined,
      });
      if (!result.success) return;

      updateUserData({
        name: name.trim(),
        fullName: name.trim(),
        cityId,
        cityName: cities.find((c) => c.cityId === cityId)?.cityName,
      });
      refreshAuth();
    } finally {
      setIsSaving(false);
    }
  };

  const openVerification = async (type: 'email' | 'phone') => {
    if (!user?.userId) return;

    let identifierToSend = '';
    if (type === 'email') {
      if (!isEmailIdentifier(email)) {
        setContactError('Please enter a valid email before verification.');
        return;
      }
      identifierToSend = email.trim().toLowerCase();
    } else {
      if (!/^3\\d{9}$/.test(phoneInput)) {
        setContactError('Use Pakistani mobile format 3XXXXXXXXX');
        return;
      }
      setContactError('');
      identifierToSend = `0${phoneInput}`;
    }

    setOtpType(type);

    const expireMinutes = type === 'phone' ? 5 : 2;
    const cooldown = type === 'phone' ? 300 : 120;

    setIsSendingOtp(true);
    try {
      const result = await sendIdentifierOtp(identifierToSend, 1, user.userId, expireMinutes);
      if (!result.success) return;
      setOtpIdentifier(result.normalizedIdentifier);
      setOtpValue('');
      setOtpError('');
      setOtpResetKey(`${Date.now()}`);
      setOtpOpen(true);
      setResendCountdown(cooldown);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!user?.userId) return;
    if (resendCountdown > 0) return;

    const expireMinutes = otpType === 'phone' ? 5 : 2;
    const cooldown = otpType === 'phone' ? 300 : 120;

    const result = await sendIdentifierOtp(otpIdentifier, 1, user.userId, expireMinutes);
    if (result.success) {
      setOtpValue('');
      setOtpError('');
      setOtpResetKey(`${Date.now()}`);
      setResendCountdown(cooldown);
    }
  };

  const verifyContact = async (otp: string) => {
    if (!user?.userId) return;
    if (otp.length !== VALIDATION.OTP_LENGTH || isVerifyingOtp) return;
    setOtpValue(otp);
    setIsVerifyingOtp(true);
    setOtpError('');
    try {
      const result = await verifyIdentifierOtp(otpIdentifier, otp, 1, user.userId);
      if (!result.success) {
        setOtpError('Invalid OTP. Please try again.');
        return;
      }

      // Persist identifier after OTP success
      const editResult = await editProfile({
        uid: user.userId,
        name: name.trim(),
        cityId,
        mobNumber: otpType === 'phone' ? result.normalizedIdentifier : undefined,
        identifier: otpType === 'phone' ? result.normalizedIdentifier : result.normalizedIdentifier,
      });

      if (!editResult.success) return;

      if (otpType === 'email') {
        updateUserData({ email: result.normalizedIdentifier });
      } else {
        updateUserData({
          mobNumber: `92${result.normalizedIdentifier.replace(/^0/, '')}`,
        });
      }

      refreshAuth();
      setOtpOpen(false);
      toast.success(`${otpType === 'email' ? 'Email' : 'Phone'} verified successfully.`);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  if (!isLoading && !isAuthenticated) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-500">Loading profile...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-28">
      <div className="mx-auto max-w-4xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="overflow-hidden rounded-2xl bg-white shadow-lg"
        >
          <div className="bg-gradient-to-r from-[#003049] to-[#004d6d] p-6 text-white">
            <div className="flex items-center gap-3">
              {/* <Image
                src="/logo/logomain.jpg"
                alt="UDealZone"
                width={34}
                height={34}
                className="h-9 w-9 rounded-lg object-cover"
              /> */}
              <h1 className="text-2xl font-bold">Profile Settings</h1>
            </div>
            <p className="mt-1 text-sm text-white/80">
              Update your personal details and verify your contact information.
            </p>
          </div>

          <div className="grid gap-6 p-6 md:grid-cols-[250px_1fr]">
            <div className="space-y-4">
              <div className="relative mx-auto h-36 w-36 overflow-hidden rounded-full border-4 border-white shadow">
                <Image
                  src={getImageUrlWithFallback(avatarPath || user.imageurl || null)}
                  alt="Profile"
                  fill
                  sizes="144px"
                  className="object-cover"
                />
              </div>

              <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                <FiCamera />
                {isUploadingImage ? 'Uploading...' : 'Upload photo'}
                <input type="file" accept="image/*" className="hidden" onChange={pickProfileImage} />
              </label>
            </div>

            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-3 focus:border-[#F97316] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700">City</label>
                  <div className="relative">
                    <FiMapPin className="absolute left-3 top-3.5 text-gray-400" />
                    <select
                      value={cityId}
                      onChange={(e) => setCityId(Number(e.target.value))}
                      className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 focus:border-[#F97316] focus:outline-none"
                    >
                      {!cities.some((c) => c.cityId === cityId) && user?.cityName ? (
                        <option value={cityId}>{user.cityName}</option>
                      ) : null}
                      {cities.map((city) => (
                        <option key={city.cityId} value={city.cityId}>
                          {city.cityName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiMail />
                  Email
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-[#F97316] focus:outline-none"
                  placeholder="your@email.com"
                  disabled={emailLocked}
                />
                <div className="mt-2 flex items-center justify-between">
                  {emailVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <FiCheckCircle />
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not verified yet</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openVerification('email')}
                    disabled={isSendingOtp || emailLocked}
                    className="rounded-lg border border-[#003049] px-3 py-1.5 text-sm font-medium text-[#003049] hover:bg-[#003049] hover:text-white disabled:opacity-50"
                  >
                    Verify Email
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <FiPhone />
                  Mobile Number (Optional)
                </div>
                <PakistanPhoneInput value={phoneInput} onChange={setPhoneInput} disabled={phoneLocked} />
                <div className="mt-2 flex items-center justify-between">
                  {phoneVerified ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                      <FiCheckCircle />
                      Verified
                    </span>
                  ) : (
                    <span className="text-xs text-gray-500">Not verified yet</span>
                  )}
                  <button
                    type="button"
                    onClick={() => openVerification('phone')}
                    disabled={isSendingOtp || phoneLocked}
                    className="rounded-lg border border-[#003049] px-3 py-1.5 text-sm font-medium text-[#003049] hover:bg-[#003049] hover:text-white disabled:opacity-50"
                  >
                    Verify Phone
                  </button>
                </div>
              </div>

              {user.promocode ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-semibold text-amber-900">Promo Code</p>
                  <p className="mt-1 text-sm text-amber-900/90">
                    <span className="font-mono">{user.promocode}</span>
                  </p>
                </div>
              ) : null}

              {contactError ? <p className="text-sm text-red-500">{contactError}</p> : null}

              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#003049] py-2.5 font-semibold text-white disabled:opacity-50"
              >
                <FiSave />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {otpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">
              Verify {otpType === 'email' ? 'Email' : 'Phone'}
            </h2>
            <p className="mb-4 text-sm text-gray-600">
              Enter the 6-digit OTP sent to <strong>{otpIdentifier}</strong>
            </p>
            <OtpCodeInput
              resetKey={otpResetKey}
              disabled={isVerifyingOtp}
              error={otpError}
              onChange={setOtpValue}
              onComplete={verifyContact}
            />
            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-[#003049] py-2.5 font-semibold text-white disabled:opacity-50"
              disabled={isVerifyingOtp || otpValue.length !== VALIDATION.OTP_LENGTH}
              onClick={() => verifyContact(otpValue)}
            >
              {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              className="mt-2 w-full text-sm font-medium text-[#F97316] disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendCountdown > 0 ? `Resend OTP in ${formatCountdown(resendCountdown)}` : 'Resend OTP'}
            </button>
            <button
              type="button"
              onClick={() => setOtpOpen(false)}
              className="mt-2 w-full text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

