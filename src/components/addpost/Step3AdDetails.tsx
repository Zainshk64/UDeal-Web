'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';
import {
  getProductForm,
  getCities,
  getCitiesByProvince,
  getMakeCompanies,
  getBrands,
  type FormFieldResponse,
} from '@/src/api/services/EditAd/FormFieldApi';
import { checkImagesSafe, upsertProductCreate } from '@/src/api/services/addPostApi';
import { upsertProductPictures } from '@/src/api/services/EditAd/EditAdApi';
import {
  getFieldConfig,
  SKIP_FIELDS,
  DROPDOWN_FIELDS,
  GENDER_OPTIONS,
  ASSEMBLY_OPTIONS,
  DOCUMENTS_OPTIONS,
  WARRANTY_OPTIONS,
  ISFURNISHED_OPTIONS,
  PROPERTYTYPE_OPTIONS,
  UTILITIES_OPTIONS,
  RAM_OPTIONS,
  type DropdownOption as StaticOption,
} from '@/src/components/addpost/fieldConfig';
import { AddPostImageStrip } from '@/src/components/addpost/AddPostImageStrip';
import { AddPostPhoneVerify } from '@/src/components/addpost/AddPostPhoneVerify';

const EXTRA_SKIP = ['ContactNumber'];

type FieldValues = Record<string, string | number | boolean | undefined>;

function isDropdownField(fieldName: string, config: ReturnType<typeof getFieldConfig>): boolean {
  return DROPDOWN_FIELDS.includes(fieldName) || config.type === 'dropdown';
}

function coerceForApi(
  fieldName: string,
  raw: string | number | undefined,
  config: ReturnType<typeof getFieldConfig>
): string | number | undefined {
  if (raw === undefined || raw === '') return undefined;
  if (config.type === 'number' || fieldName === 'Price') {
    const n = typeof raw === 'number' ? raw : Number(String(raw).replace(/,/g, ''));
    return Number.isFinite(n) ? n : undefined;
  }
  if (fieldName.endsWith('Id') && fieldName !== 'Gender') {
    const n = typeof raw === 'number' ? raw : Number(raw);
    return Number.isFinite(n) ? n : raw;
  }
  return typeof raw === 'number' ? raw : String(raw);
}

export type Step3AdDetailsProps = {
  categoryId: number;
  subCatId: number;
  categoryName: string;
  subcategoryName: string;
};

export function Step3AdDetails({
  categoryId,
  subCatId,
  categoryName,
  subcategoryName,
}: Step3AdDetailsProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [formData, setFormData] = useState<FormFieldResponse>({ activeFields: [] });
  const [fieldValues, setFieldValues] = useState<FieldValues>({ CountryId: 1 });
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});
  const [fieldErrorMessages, setFieldErrorMessages] = useState<Record<string, string>>({});
  const [cachedOptions, setCachedOptions] = useState<Record<string, StaticOption[]>>({});
  const [priceMin, setPriceMin] = useState<number | null>(null);

  const [images, setImages] = useState<File[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showMyNumber, setShowMyNumber] = useState(true);
  const [verifiedPhone, setVerifiedPhone] = useState('');
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [showPhoneError, setShowPhoneError] = useState(false);

  const userId = user?.userId ?? 0;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const data = await getProductForm(categoryId, subCatId);
      if (cancelled) return;
      setFormData(data);
      setFieldValues({ CountryId: 1 });
      const pr = data.priceRange?.[0]?.MinPrice;
      setPriceMin(typeof pr === 'number' && pr > 0 ? pr : null);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [categoryId, subCatId]);

  const activeFieldNames = useMemo(() => {
    return formData.activeFields
      .map((f) => f.FieldName)
      .filter((name) => !SKIP_FIELDS.includes(name) && !EXTRA_SKIP.includes(name));
  }, [formData.activeFields]);

  const loadDropdownOptions = useCallback(
    async (fieldName: string): Promise<StaticOption[]> => {
      const config = getFieldConfig(fieldName);
      const fd = formData as Record<string, unknown>;

      if (fieldName === 'Gender') return GENDER_OPTIONS;
      if (fieldName === 'EngineAssembly') {
        const arr = fd.assemblies ?? fd['assemblies'];
        if (Array.isArray(arr) && arr.length) {
          return arr.map((item: { Id?: number; Name?: string }) => ({
            id: item.Id ?? 0,
            name: item.Name ?? '',
          }));
        }
        return ASSEMBLY_OPTIONS;
      }
      if (fieldName === 'Documents') return DOCUMENTS_OPTIONS;
      if (fieldName === 'IsFurnished') {
        const arr = fd.IsFurnished;
        if (Array.isArray(arr) && arr.length) {
          return arr.map((item: { Id?: number | string; Name?: string }) => ({
            id: item.Id ?? '',
            name: item.Name ?? '',
          }));
        }
        return ISFURNISHED_OPTIONS;
      }
      if (fieldName === 'Warranty') return WARRANTY_OPTIONS;
      if (fieldName === 'PropertyType') {
        const arr = fd.propertyTypes;
        if (Array.isArray(arr) && arr.length) {
          return arr.map((item: { Id?: number | string; Name?: string }) => ({
            id: item.Id ?? '',
            name: item.Name ?? '',
          }));
        }
        return PROPERTYTYPE_OPTIONS;
      }
      if (fieldName === 'UtilitiesAvailable') return UTILITIES_OPTIONS;
      if (fieldName === 'RAM' || fieldName === 'Storage') {
        const key = fieldName === 'RAM' ? 'ramOptions' : 'storageOptions';
        const arr = fd[key];
        if (Array.isArray(arr) && arr.length) {
          return arr.map((item: { Id?: number | string; Name?: string }) => ({
            id: item.Id ?? '',
            name: item.Name ?? '',
          }));
        }
        return RAM_OPTIONS;
      }

      if (config.dropdownKey) {
        const raw = fd[config.dropdownKey];
        if (Array.isArray(raw) && raw.length) {
          return raw.map((item: { Id?: number; id?: number; Name?: string; name?: string; Area?: string }) => ({
            id: item.Id ?? item.id ?? 0,
            name: item.Name ?? item.name ?? item.Area ?? '',
          }));
        }
      }

      if (fieldName === 'CityId') {
        const pid = fieldValues['ProvinceId'];
        if (!pid) return [];
        return getCitiesByProvince(Number(pid));
      }
      if (fieldName === 'RegCityId') return getCities();
      if (fieldName === 'MakeCompanyId') return getMakeCompanies(categoryId);
      if (fieldName === 'BrandId') {
        const pid = fieldValues['MakeCompanyId'];
        if (!pid) return [];
        return getBrands(Number(pid));
      }

      return [];
    },
    [formData, fieldValues, categoryId]
  );

  const refreshDropdown = useCallback(
    async (fieldName: string) => {
      const opts = await loadDropdownOptions(fieldName);
      setCachedOptions((prev) => ({ ...prev, [fieldName]: opts }));
    },
    [loadDropdownOptions]
  );

  useEffect(() => {
    (async () => {
      if (fieldValues['ProvinceId']) {
        const opts = await loadDropdownOptions('CityId');
        setCachedOptions((prev) => ({ ...prev, CityId: opts }));
      }
    })();
  }, [fieldValues['ProvinceId'], loadDropdownOptions]);

  useEffect(() => {
    (async () => {
      if (fieldValues['MakeCompanyId']) {
        const opts = await loadDropdownOptions('BrandId');
        setCachedOptions((prev) => ({ ...prev, BrandId: opts }));
      }
    })();
  }, [fieldValues['MakeCompanyId'], loadDropdownOptions]);

  const getFieldDisabledState = (fieldName: string): { disabled: boolean; reason: string } => {
    if (fieldName === 'BrandId') {
      return {
        disabled: !fieldValues['MakeCompanyId'],
        reason: 'Select Make/Company first.',
      };
    }
    if (fieldName === 'CityId') {
      return {
        disabled: !fieldValues['ProvinceId'],
        reason: 'Select Province first.',
      };
    }
    return { disabled: false, reason: '' };
  };

  const handleDropdownChange = (fieldName: string, value: string) => {
    const config = getFieldConfig(fieldName);
    let coerced: string | number = value;
    if (fieldName.endsWith('Id') && fieldName !== 'Gender' && value !== '') {
      const n = Number(value);
      if (!Number.isNaN(n)) coerced = n;
    }
    setFieldValues((prev) => ({ ...prev, [fieldName]: coerced }));
    setFieldErrors((prev) => ({ ...prev, [fieldName]: false }));
    setFieldErrorMessages((prev) => ({ ...prev, [fieldName]: '' }));

    if (fieldName === 'ProvinceId') {
      setFieldValues((prev) => ({ ...prev, CityId: undefined }));
      setCachedOptions((prev) => ({ ...prev, CityId: [] }));
    }
    if (fieldName === 'MakeCompanyId') {
      setFieldValues((prev) => ({ ...prev, BrandId: undefined }));
      setCachedOptions((prev) => ({ ...prev, BrandId: [] }));
    }
  };

  const handleTextChange = (fieldName: string, value: string) => {
    setFieldValues((prev) => ({ ...prev, [fieldName]: value }));
    setFieldErrors((prev) => ({ ...prev, [fieldName]: false }));
    setFieldErrorMessages((prev) => ({ ...prev, [fieldName]: '' }));
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    const msgs: Record<string, string> = {};
    let ok = true;

    if (!termsAccepted) {
      toast.error('Please accept the Terms & Conditions.');
      return false;
    }
    if (images.length < 1) {
      toast.error('Add at least one photo.');
      return false;
    }
    // if (!phoneVerified || !verifiedPhone) {
    //   setShowPhoneError(true);
    //   toast.error('Verify your contact number.');
    //   return false;
    // }

    activeFieldNames.forEach((fieldName) => {
      const config = getFieldConfig(fieldName);
      if (config.type === 'hidden') return;
      if (config.required === false) return;

      const value = fieldValues[fieldName];
      const empty =
        value === undefined ||
        value === null ||
        (typeof value === 'string' && value.trim() === '') ||
        (typeof value === 'number' && Number.isNaN(value));

      if (empty) {
        errors[fieldName] = true;
        msgs[fieldName] = `${config.label} is required`;
        ok = false;
        return;
      }

      if (
        config.minLength &&
        typeof value === 'string' &&
        value.trim().length < config.minLength
      ) {
        errors[fieldName] = true;
        msgs[fieldName] = `${config.label} must be at least ${config.minLength} characters`;
        ok = false;
      }

      if (fieldName === 'Price' && priceMin != null) {
        const pv = Number(value);
        if (Number.isFinite(pv) && pv < priceMin) {
          errors[fieldName] = true;
          msgs[fieldName] = `Minimum price is PKR ${priceMin.toLocaleString()}`;
          ok = false;
        }
      }
    });

    setFieldErrors(errors);
    setFieldErrorMessages(msgs);
    if (!ok) {
      const first = Object.values(msgs)[0];
      toast.error(first || 'Please fix the highlighted fields.');
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      toast.error('Please sign in again.');
      router.push(ROUTES.LOGIN);
      return;
    }
    if (!validateForm()) return;

    setPosting(true);
    try {
      const scan = await checkImagesSafe(images);
      const imagesSafe = scan.isSafe;
      const apiResponse = imagesSafe
        ? scan.reasons.length
          ? `PASSED_WITH_NOTE: ${scan.reasons.join(', ')}`
          : 'PASSED'
        : `BLOCKED: ${scan.reasons.join(', ')}`;

      const enableBool = imagesSafe;

      const data: Record<string, unknown> = {
        Enable: enableBool,
        ApiResponse: apiResponse,
        ShowMyNumber: showMyNumber,
        ContactNumber: verifiedPhone,
      };

      activeFieldNames.forEach((fieldName) => {
        const config = getFieldConfig(fieldName);
        if (config.type === 'hidden') return;
        const v = fieldValues[fieldName];
        const coerced = coerceForApi(fieldName, v as string | number | undefined, config);
        if (coerced !== undefined) data[fieldName] = coerced;
      });

      const productId = await upsertProductCreate(categoryId, subCatId, userId, data);
      if (!productId) throw new Error('upsert');

      const pictureItems = images.map((file, i) => ({
        file,
        isMain: i === mainImageIndex,
        isExisting: false as const,
      }));

      const uploaded = await upsertProductPictures(productId, userId, pictureItems);
      if (!uploaded) {
        toast.warning('Ad created, but photos may still be processing.');
      } else {
        toast.success('Your ad has been posted.');
      }
      router.push(ROUTES.MY_ADS);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        <p className="text-sm text-slate-600">Loading form for {subcategoryName}…</p>
      </div>
    );
  }

  if (activeFieldNames.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <p className="font-medium text-amber-900">No form fields for this subcategory yet.</p>
        <p className="mt-1 text-sm text-amber-800">Try another subcategory or check back later.</p>
      </div>
    );
  }

  const renderField = (fieldName: string) => {
    const config = getFieldConfig(fieldName);
    if (config.type === 'hidden') return null;

    const hasError = fieldErrors[fieldName];
    const value = fieldValues[fieldName];
    const errMsg =
      fieldErrorMessages[fieldName] ||
      (hasError ? `${config.label} is required` : '');

    const isTextarea = config.type === 'textarea';
    const isDropdown = isDropdownField(fieldName, config);
    const spanClass = isTextarea ? 'md:col-span-2' : '';

    if (isDropdown) {
      const { disabled, reason } = getFieldDisabledState(fieldName);
      const opts = cachedOptions[fieldName] ?? [];

      return (
        <div key={fieldName} className={spanClass}>
          <label className="mb-1 block text-sm font-medium text-slate-800">
            {config.label}
            {config.required !== false && <span className="text-red-500"> *</span>}
          </label>
          <select
            disabled={disabled || posting}
            value={value === undefined || value === null ? '' : String(value)}
            onFocus={() => void refreshDropdown(fieldName)}
            onChange={(e) => handleDropdownChange(fieldName, e.target.value)}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-[#003049]/30 ${
              hasError ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'
            } ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
          >
            <option value="">{config.placeholder || `Select ${config.label}`}</option>
            {opts.map((o) => (
              <option key={`${fieldName}-${o.id}`} value={String(o.id)}>
                {o.name}
              </option>
            ))}
          </select>
          {disabled && reason ? (
            <p className="mt-1 text-xs text-amber-700">{reason}</p>
          ) : null}
          {hasError && errMsg ? <p className="mt-1 text-xs text-red-600">{errMsg}</p> : null}
        </div>
      );
    }

    if (isTextarea) {
      const len = String(value ?? '').length;
      const min = config.minLength;
      return (
        <div key={fieldName} className={spanClass}>
          <div className="mb-1 flex items-center justify-between gap-2">
            <label className="text-sm font-medium text-slate-800">
              {config.label}
              {config.required !== false && <span className="text-red-500"> *</span>}
            </label>
            {min ? (
              <span className="text-xs text-slate-500">
                {len}/{min} min
              </span>
            ) : null}
          </div>
          <textarea
            value={String(value ?? '')}
            rows={5}
            disabled={posting}
            onChange={(e) => handleTextChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-[#003049]/30 ${
              hasError ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'
            }`}
          />
          {hasError && errMsg ? <p className="mt-1 text-xs text-red-600">{errMsg}</p> : null}
        </div>
      );
    }

    const isNum = config.type === 'number' || config.keyboardType === 'numeric';
    const priceHint =
      fieldName === 'Price' && priceMin != null
        ? `Minimum PKR ${priceMin.toLocaleString()}`
        : '';

    return (
      <div key={fieldName} className={spanClass}>
        <label className="mb-1 block text-sm font-medium text-slate-800">
          {config.label}
          {config.required !== false && <span className="text-red-500"> *</span>}
          {priceHint ? (
            <span className="ml-2 text-xs font-normal text-slate-500">({priceHint})</span>
          ) : null}
        </label>
        <input
          type={isNum ? 'number' : 'text'}
          inputMode={isNum ? 'numeric' : undefined}
          disabled={posting}
          value={value === undefined || value === null ? '' : String(value)}
          onChange={(e) => handleTextChange(fieldName, e.target.value)}
          placeholder={config.placeholder}
          className={`w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-[#003049]/30 ${
            hasError ? 'border-red-400 bg-red-50/50' : 'border-slate-300 bg-white'
          }`}
        />
        {hasError && errMsg ? <p className="mt-1 text-xs text-red-600">{errMsg}</p> : null}
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="add-post-step3-form">
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm sm:p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Listing</p>
        <p className="mt-1 text-lg font-semibold text-slate-900">
          {categoryName}
          <span className="text-slate-400">/</span>
          <span className="text-slate-700">{subcategoryName}</span>
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <AddPostImageStrip
          files={images}
          mainIndex={mainImageIndex}
          onFilesChange={setImages}
          onMainIndexChange={setMainImageIndex}
          disabled={posting}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">{activeFieldNames.map((fn) => renderField(fn))}</div>

      <AddPostPhoneVerify
        userId={userId}
        initialMobNumber={user?.mobNumber}
        onVerified={(phone) => {
          setVerifiedPhone(phone);
          // setPhoneVerified(true);
          setShowPhoneError(false);
        }}
        hasError={showPhoneError}
        disabled={posting}
      />

      <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-900">Show my number on the ad</p>
          <p className="text-xs text-slate-600">
            {showMyNumber ? 'Buyers can call you directly.' : 'Your number stays private in the listing.'}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={showMyNumber}
          onClick={() => setShowMyNumber(!showMyNumber)}
          disabled={posting}
          className={`relative h-9 w-14 shrink-0 rounded-full transition-colors ${
            showMyNumber ? 'bg-[#003049]' : 'bg-slate-300'
          }`}
        >
          <span
            className={`absolute top-1 left-1 h-7 w-7 rounded-full bg-white shadow transition-transform ${
              showMyNumber ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      <label className="flex cursor-pointer gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="checkbox"
          checked={termsAccepted}
          onChange={(e) => setTermsAccepted(e.target.checked)}
          disabled={posting}
          className="mt-1 h-4 w-4 rounded border-slate-400 text-[#003049] focus:ring-[#003049]"
        />
        <span className="text-sm text-slate-700">
          I agree to the Terms of Service and Privacy Policy, and I confirm this listing follows the marketplace rules.
        </span>
      </label>

      {!termsAccepted && (
        <p className="text-xs text-amber-700">You must accept the terms before posting.</p>
      )}

      <button
        type="submit"
        disabled={posting || !termsAccepted}
        className="w-full rounded-xl bg-[#F97316] py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-[#ea580c] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {posting ? 'Posting…' : 'Post ad'}
      </button>

      <p className="text-center text-xs text-slate-500">
        Images are scanned for safety before publishing. Ads may be moderated before going live.
      </p>
    </form>
  );
}
