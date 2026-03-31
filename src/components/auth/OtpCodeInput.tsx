import React, { useEffect, useRef, useState } from 'react';

interface OtpCodeInputProps {
  length?: number;
  onComplete: (otp: string) => void;
  onChange?: (otp: string) => void;
  disabled?: boolean;
  error?: string;
  resetKey?: string;
}

export default function OtpCodeInput({
  length = 6,
  onComplete,
  onChange,
  disabled = false,
  error,
  resetKey,
}: OtpCodeInputProps) {
  const [digits, setDigits] = useState<string[]>(Array(length).fill(''));
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setDigits(Array(length).fill(''));
    refs.current[0]?.focus();
  }, [length, resetKey]);

  useEffect(() => {
    const joined = digits.join('');
    onChange?.(joined);
    if (joined.length === length && !joined.includes('')) {
      onComplete(joined);
    }
  }, [digits, length, onChange, onComplete]);

  const setDigit = (index: number, raw: string) => {
    if (!/^\d*$/.test(raw)) return;
    const value = raw.slice(-1);
    const next = [...digits];
    next[index] = value;
    setDigits(next);
    if (value && index < length - 1) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    const next = Array(length).fill('');
    pasted.split('').forEach((digit, idx) => {
      next[idx] = digit;
    });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, length - 1);
    refs.current[focusIndex]?.focus();
  };

  return (
    <div>
      <div className="flex justify-center gap-2">
        {digits.map((digit, idx) => (
          <input
            key={idx}
            ref={(el) => {
              refs.current[idx] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => setDigit(idx, e.target.value)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onPaste={handlePaste}
            onFocus={(e) => e.target.select()}
            className="h-12 w-12 rounded-lg border-2 border-gray-300 text-center text-xl font-bold focus:border-[#F97316] focus:outline-none"
          />
        ))}
      </div>
      {error ? <p className="mt-2 text-center text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
