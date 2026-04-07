'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import PakistanPhoneInput from '@/src/components/auth/PakistanPhoneInput';
import { AddPostPhoneVerify } from '@/src/components/addpost/AddPostPhoneVerify';
import {
  getProvinces,
  getCitiesByProvinceBuyer,
  getMakeCompaniesBuyer,
  getBrandsBuyer,
  getMakeYearsBuyer,
  getFuelTypesBuyer,
  getTransmissionsBuyer,
  getColorsBuyer,
  getUnitAreasBuyer,
  type BuyerDropdownOption,
  submitBuyerRequest,
} from '@/src/api/services/buyerPostApi';
import { resolveBuyerFormFields, type FormField } from '@/src/components/buyers/buyerFormConfig';
import { toApiPhone } from '@/src/api/services/AuthApi';
import { updateUserData } from '@/src/utils/storage';
import { cn } from '@/src/utils/cn';

type Props = {
  categoryId: number;
  subCatId: number;
  userId: number;
  productReqId: number;
  initialValues: Record<string, unknown>;
  profilePhoneDigits: string;
  onSuccess: () => void;
  onBack: () => void;
};

function digitsFromContactApi(contact?: string): string {
  if (!contact) return '';
  const d = contact.replace(/\D/g, '');
  if (d.length >= 12 && d.startsWith('92')) return d.slice(-10);
  if (d.length >= 11 && d.startsWith('0')) return d.slice(1, 11);
  if (d.length === 10 && d.startsWith('3')) return d;
  return d.slice(-10);
}

export function BuyerRequestFormStep({
  categoryId,
  subCatId,
  userId,
  productReqId,
  initialValues,
  profilePhoneDigits,
  onSuccess,
  onBack,
}: Props) {
  const fields = useMemo(
    () => resolveBuyerFormFields(categoryId, subCatId),
    [categoryId, subCatId]
  );

  const [values, setValues] = useState<Record<string, unknown>>({});
  const [optionsCache, setOptionsCache] = useState<Record<string, BuyerDropdownOption[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [phoneDigits, setPhoneDigits] = useState('');
  const [phoneVerifiedForSubmit, setPhoneVerifiedForSubmit] = useState(false);
  const [initialSnapshot, setInitialSnapshot] = useState('');

  useEffect(() => {
    setOptionsCache((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (k.startsWith('CityId-')) delete next[k];
      });
      return next;
    });
  }, [values.ProvinceId]);

  useEffect(() => {
    const base: Record<string, unknown> = {
      ShowMyContactNo: true,
      ...initialValues,
    };
    const fromContact = digitsFromContactApi(String(initialValues.ContactNo ?? ''));
    const startDigits = fromContact || profilePhoneDigits;
    if (startDigits) {
      base.ContactNo = startDigits;
      setPhoneDigits(startDigits);
      setInitialSnapshot(startDigits);
      setPhoneVerifiedForSubmit(true);
    } else {
      setPhoneDigits('');
      setInitialSnapshot('');
      setPhoneVerifiedForSubmit(false);
    }
    setValues(base);
  }, [initialValues, profilePhoneDigits]);

  const loadOptions = useCallback(
    async (fetchName: string, ctx: { provinceId?: number; makeId?: number }) => {
      switch (fetchName) {
        case 'getProvinces':
          return getProvinces();
        case 'getCitiesByProvince':
          return ctx.provinceId ? getCitiesByProvinceBuyer(ctx.provinceId) : [];
        case 'getMakeCompanies':
          return getMakeCompaniesBuyer(categoryId);
        case 'getBrands':
          return ctx.makeId ? getBrandsBuyer(ctx.makeId) : [];
        case 'getMakeYears':
          return getMakeYearsBuyer();
        case 'getFuelTypes':
          return getFuelTypesBuyer(categoryId);
        case 'getTransmissions':
          return getTransmissionsBuyer();
        case 'getColors':
          return getColorsBuyer();
        case 'getUnitAreas':
          return getUnitAreasBuyer();
        default:
          return [];
      }
    },
    [categoryId]
  );

  const ensureOptions = async (field: FormField) => {
    if (!field.fetchOptions || field.type !== 'dropdown') return;
    const key = `${field.key}-${field.fetchOptions}`;
    if (optionsCache[key]?.length) return;
    const provinceId = Number(values.ProvinceId) || undefined;
    const makeId = Number(values.MakeId) || undefined;
    const opts = await loadOptions(field.fetchOptions, { provinceId, makeId });
    setOptionsCache((p) => ({ ...p, [key]: opts }));
  };

  const setVal = (k: string, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [k]: v };
      if (k === 'ProvinceId') {
        next.CityId = undefined;
      }
      if (k === 'MakeId') {
        next.BrandId = undefined;
      }
      return next;
    });
  };

  const validate = (): boolean => {
    for (const f of fields) {
      if (f.type === 'range' && f.rangeFields) {
        if (f.required) {
          const a = values[f.rangeFields.from];
          const b = values[f.rangeFields.to];
          if (a === undefined || a === '' || b === undefined || b === '') {
            toast.error(`Fill ${f.label}`);
            return false;
          }
        }
        continue;
      }
      if (f.required && f.type !== 'checkbox') {
        const v = values[f.key];
        if (v === undefined || v === null || v === '') {
          toast.error(`${f.label} is required`);
          return false;
        }
      }
      if (f.dependsOn) {
        const parent = values[f.dependsOn];
        if (!parent && f.required) {
          toast.error(`Select ${f.dependsOn} first`);
          return false;
        }
      }
    }
    if (fields.some((x) => x.key === 'TermsAndAgreement')) {
      if (!values.TermsAndAgreement) {
        toast.error('Accept terms and conditions');
        return false;
      }
    }
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith('3')) {
      toast.error('Valid contact number required');
      return false;
    }
    if (!phoneVerifiedForSubmit) {
      toast.error('Verify your phone number with OTP');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const payload = { ...values };
    payload.ContactNo = toApiPhone(`+92${phoneDigits}`);
    setSubmitting(true);
    const res = await submitBuyerRequest(
      payload,
      categoryId,
      subCatId,
      userId,
      productReqId
    );
    setSubmitting(false);
    if (res.success) onSuccess();
  };

  const renderField = (f: FormField) => {
    if (f.dependsOn && !values[f.dependsOn]) {
      return (
        <div key={f.key} className="md:col-span-2">
          <p className="text-xs text-amber-700">
            Select {fields.find((x) => x.key === f.dependsOn)?.label ?? f.dependsOn} first to unlock{' '}
            {f.label}.
          </p>
        </div>
      );
    }

    if (f.key === 'PriceRange' && f.type === 'range' && f.rangeFields) {
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={values[f.rangeFields.from] ?? ''}
              onChange={(e) => setVal(f.rangeFields!.from, e.target.value)}
              placeholder="From (PKR)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={values[f.rangeFields.to] ?? ''}
              onChange={(e) => setVal(f.rangeFields!.to, e.target.value)}
              placeholder="To (PKR)"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      );
    }

    if (f.key === 'YearRange' && f.type === 'range' && f.rangeFields) {
      const cacheKey = `YearRange-getMakeYears`;
      const opts = optionsCache[cacheKey] || [];
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">{f.label}</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={values[f.rangeFields.from] ?? ''}
              onFocus={async () => {
                const o = await getMakeYearsBuyer();
                setOptionsCache((p) => ({ ...p, [cacheKey]: o }));
              }}
              onChange={(e) => setVal(f.rangeFields!.from, e.target.value ? Number(e.target.value) : '')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">From year</option>
              {opts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
            <select
              value={values[f.rangeFields.to] ?? ''}
              onFocus={async () => {
                const o = await getMakeYearsBuyer();
                setOptionsCache((p) => ({ ...p, [cacheKey]: o }));
              }}
              onChange={(e) => setVal(f.rangeFields!.to, e.target.value ? Number(e.target.value) : '')}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            >
              <option value="">To year</option>
              {opts.map((o) => (
                <option key={`t-${o.id}`} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      );
    }

    if (f.key === 'AreaSizeRange' && f.type === 'range' && f.rangeFields) {
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">{f.label}</label>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              value={values[f.rangeFields.from] ?? ''}
              onChange={(e) => setVal(f.rangeFields!.from, e.target.value)}
              placeholder="From"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
            <input
              type="number"
              value={values[f.rangeFields.to] ?? ''}
              onChange={(e) => setVal(f.rangeFields!.to, e.target.value)}
              placeholder="To"
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
      );
    }

    if (f.type === 'dropdown' && f.options) {
      return (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={values[f.key] ?? ''}
            onChange={(e) =>
              setVal(f.key, e.target.value ? Number(e.target.value) : '')
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">Select</option>
            {f.options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === 'dropdown' && f.fetchOptions) {
      const key = `${f.key}-${f.fetchOptions}`;
      const opts = optionsCache[key] || [];
      return (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-gray-800">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          <select
            value={values[f.key] ?? ''}
            onFocus={() => void ensureOptions(f)}
            onChange={(e) =>
              setVal(f.key, e.target.value ? Number(e.target.value) : '')
            }
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          >
            <option value="">{f.placeholder || 'Select'}</option>
            {opts.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </div>
      );
    }

    if (f.type === 'textarea') {
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          <textarea
            value={String(values[f.key] ?? '')}
            onChange={(e) => setVal(f.key, e.target.value)}
            rows={4}
            placeholder={f.placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      );
    }

    if (f.type === 'checkbox') {
      return (
        <label key={f.key} className="flex cursor-pointer items-center gap-2 md:col-span-2">
          <input
            type="checkbox"
            checked={Boolean(values[f.key])}
            onChange={(e) => setVal(f.key, e.target.checked)}
            className="rounded border-gray-300 text-[#F97316]"
          />
          <span className="text-sm text-gray-800">{f.label}</span>
        </label>
      );
    }

    if (f.type === 'number') {
      return (
        <div key={f.key}>
          <label className="mb-1 block text-sm font-medium text-gray-800">{f.label}</label>
          <input
            type="number"
            value={values[f.key] ?? ''}
            onChange={(e) => setVal(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      );
    }

    if (f.type === 'text') {
      return (
        <div key={f.key} className="md:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-800">
            {f.label} {f.required && <span className="text-red-500">*</span>}
          </label>
          <input
            type="text"
            value={String(values[f.key] ?? '')}
            onChange={(e) => setVal(f.key, e.target.value)}
            placeholder={f.placeholder}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
          />
        </div>
      );
    }

    return null;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-gray-900">Request details</h2>
        <button type="button" onClick={onBack} className="text-sm text-[#003049] hover:underline">
          ← Change subcategory
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields
          .filter((f) => f.type !== 'phone')
          .map((f) => renderField(f))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4">
        <label className="mb-2 block text-sm font-medium text-gray-800">
          Contact number <span className="text-red-500">*</span>
        </label>
        <PakistanPhoneInput
          value={phoneDigits}
          onChange={(d) => {
            setPhoneDigits(d);
            if (d !== initialSnapshot) setPhoneVerifiedForSubmit(false);
            else if (initialSnapshot) setPhoneVerifiedForSubmit(true);
          }}
        />
        {!phoneVerifiedForSubmit && (
          <div className="mt-4">
            <AddPostPhoneVerify
              userId={userId}
              initialMobNumber={phoneDigits.length === 10 ? `+92${phoneDigits}` : undefined}
              onVerified={(apiPhone) => {
                setPhoneVerifiedForSubmit(true);
                setInitialSnapshot(phoneDigits);
                updateUserData({ mobNumber: apiPhone });
                toast.success('Phone verified and saved');
              }}
              hasError={false}
            />
            <p className="mt-2 text-xs text-gray-500">
              Verify with OTP to confirm this number. If you changed it, we update your profile.
            </p>
          </div>
        )}
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={submitting}
          className={cn(
            'rounded-xl bg-[#F97316] px-8 py-3 font-semibold text-white',
            submitting && 'opacity-60'
          )}
        >
          {submitting ? 'Saving…' : productReqId ? 'Update request' : 'Submit request'}
        </button>
      </div>
    </form>
  );
}
