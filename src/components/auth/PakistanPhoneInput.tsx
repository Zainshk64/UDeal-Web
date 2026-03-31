import React from 'react';

interface PakistanPhoneInputProps {
  value: string;
  onChange: (next: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function PakistanPhoneInput({
  value,
  onChange,
  error,
  placeholder = '3XXXXXXXXX',
  disabled = false,
}: PakistanPhoneInputProps) {
  const handleChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, '').slice(0, 10);
    let next = digitsOnly;
    if (next.length > 0 && !next.startsWith('3')) {
      next = `3${next.slice(1)}`;
    }
    onChange(next);
  };

  return (
    <div>
      <div
        className={`flex items-center overflow-hidden rounded-lg border ${
          error ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <div className="flex items-center gap-2 border-r bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
          <span>PK</span>
          <span>+92</span>
        </div>
        <input
          type="tel"
          inputMode="numeric"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-3 py-2 focus:outline-none"
        />
      </div>
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : null}
    </div>
  );
}
