'use client';

import React, { useEffect, useState } from 'react';
import PakistanPhoneInput from '@/src/components/auth/PakistanPhoneInput';
import {
  normalizeIdentifier,
  sendMobOtp,
  verifyMobOtp,
  toApiPhone,
} from '@/src/api/services/AuthApi';

function digitsFromStoredMob(mob?: string): string {
  if (!mob) return '';
  const d = mob.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('92')) return d.slice(-10);
  if (d.length >= 11 && d.startsWith('0')) return d.slice(1, 11);
  if (d.length === 10 && d.startsWith('3')) return d;
  if (d.length > 10) return d.slice(-10);
  return d.length === 10 ? d : '';
}

export type AddPostPhoneVerifyProps = {
  userId: number;
  initialMobNumber?: string;
  onVerified: (contactForApi: string) => void;
  hasError?: boolean;
  disabled?: boolean;
  /** Parent owns {@link PakistanPhoneInput}; only OTP / verify UI is shown. */
  otpOnly?: boolean;
  /** Required when otpOnly: 10-digit local number (3xxxxxxxxx). */
  externalDigits?: string;
};

export function AddPostPhoneVerify({
  userId,
  initialMobNumber,
  onVerified,
  hasError,
  disabled,
  otpOnly = false,
  externalDigits = '',
}: AddPostPhoneVerifyProps) {
  const [digits, setDigits] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [verified, setVerified] = useState(false);
  const [busy, setBusy] = useState(false);

  const effectiveDigits = otpOnly
    ? String(externalDigits || '').replace(/\D/g, '').slice(-10)
    : digits;

  useEffect(() => {
    if (otpOnly) return;
    const pre = digitsFromStoredMob(initialMobNumber);
    if (pre) setDigits(pre);
  }, [initialMobNumber, otpOnly]);

  const identifierValue = () => {
    const raw = `+92${(otpOnly ? effectiveDigits : digits).replace(/\D/g, '')}`;
    return normalizeIdentifier(raw).value;
  };

  const handleSendOtp = async () => {
    const d = otpOnly ? effectiveDigits : digits;
    if (d.length !== 10 || !d.startsWith('3')) return;
    setBusy(true);
    try {
      const ok = await sendMobOtp(identifierValue(), 1, userId);
      if (ok) setOtpSent(true);
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async () => {
    if (!otp.trim()) return;
    setBusy(true);
    try {
      const ok = await verifyMobOtp(identifierValue(), otp.trim(), 1, userId);
      if (ok) {
        setVerified(true);
        const d = otpOnly ? effectiveDigits : digits;
        const raw = `+92${d}`;
        onVerified(toApiPhone(raw));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 ${
        hasError ? 'border-red-300 ring-1 ring-red-200' : 'border-slate-200'
      }`}
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            {otpOnly ? 'OTP verification' : 'Contact number'}{' '}
            {!otpOnly && <span className="text-red-500">*</span>}
          </h3>
          <p className="text-xs text-slate-500">
            {otpOnly ? 'Enter the code we send to this number.' : 'Verify with OTP for this listing.'}
          </p>
        </div>
        {verified && (
          <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            Verified
          </span>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {!otpOnly && (
          <div className="sm:col-span-2">
            <PakistanPhoneInput
              value={digits}
              onChange={setDigits}
              disabled={disabled || verified}
              error={hasError && !verified ? 'Verify your phone number' : undefined}
            />
          </div>
        )}

        {!verified && (
          <>
            <button
              type="button"
              disabled={
                disabled ||
                busy ||
                (otpOnly ? effectiveDigits : digits).length !== 10 ||
                !(otpOnly ? effectiveDigits : digits).startsWith('3')
              }
              onClick={handleSendOtp}
              className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-100 disabled:opacity-50"
            >
              {otpSent ? 'Resend OTP' : 'Send OTP'}
            </button>
            <div className="flex gap-2">
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                disabled={disabled || busy}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                disabled={disabled || busy || otp.length < 4}
                onClick={handleVerify}
                className="shrink-0 rounded-lg bg-[#003049] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004d6d] disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
