'use client';

import React from 'react';
import { FiX } from 'react-icons/fi';
import type {
  BrandItem,
  CategoryItem,
  CityItem,
  FilterState,
  MakeCompanyItem,
  ProvinceItem,
  SubcategoryItem,
  YearItem,
} from '@/src/api/services/HomeSearchBarApi';

type Props = {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onChange: (next: FilterState) => void;
  categories: CategoryItem[];
  subcategories: SubcategoryItem[];
  provinces: ProvinceItem[];
  cities: CityItem[];
  companies: MakeCompanyItem[];
  brands: BrandItem[];
  years: YearItem[];
  onClear: () => void;
};

function NumSelect({
  value,
  onChange,
  items,
  getValue,
  getLabel,
  placeholder,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  items: unknown[];
  getValue: (x: any) => number;
  getLabel: (x: any) => string;
  placeholder: string;
}) {
  return (
    <select
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
    >
      <option value="">{placeholder}</option>
      {items.map((x: any) => (
        <option key={getValue(x)} value={getValue(x)}>
          {getLabel(x)}
        </option>
      ))}
    </select>
  );
}

export function ProductSearchFilters(props: Props) {
  const body = (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900">Filters</h3>
        <button onClick={props.onClear} className="text-xs text-gray-500 hover:text-[#F97316]">
          Clear all
        </button>
      </div>
      <NumSelect
        value={props.filters.catId}
        onChange={(catId) =>
          props.onChange({
            ...props.filters,
            catId,
            subCatId: null,
            makeId: null,
            brandId: null,
          })
        }
        items={props.categories}
        getValue={(x) => x.catId}
        getLabel={(x) => x.categoryName}
        placeholder="Category"
      />
      <NumSelect
        value={props.filters.subCatId}
        onChange={(subCatId) => props.onChange({ ...props.filters, subCatId })}
        items={props.subcategories}
        getValue={(x) => x.subCatId}
        getLabel={(x) => x.subcategoryName}
        placeholder="Subcategory"
      />
      <NumSelect
        value={props.filters.makeId}
        onChange={(makeId) => props.onChange({ ...props.filters, makeId, brandId: null })}
        items={props.companies}
        getValue={(x) => x.makeId}
        getLabel={(x) => x.makerName}
        placeholder="Company"
      />
      <NumSelect
        value={props.filters.brandId}
        onChange={(brandId) => props.onChange({ ...props.filters, brandId })}
        items={props.brands}
        getValue={(x) => x.brandId}
        getLabel={(x) => x.brandName}
        placeholder="Brand"
      />
      <NumSelect
        value={props.filters.makeYearId}
        onChange={(makeYearId) => props.onChange({ ...props.filters, makeYearId })}
        items={props.years}
        getValue={(x) => x.myId}
        getLabel={(x) => x.makeYear}
        placeholder="Year"
      />
      <NumSelect
        value={props.filters.provinceId}
        onChange={(provinceId) => props.onChange({ ...props.filters, provinceId, cityId: null })}
        items={props.provinces}
        getValue={(x) => x.provId}
        getLabel={(x) => x.provinceName}
        placeholder="Province"
      />
      <NumSelect
        value={props.filters.cityId}
        onChange={(cityId) => props.onChange({ ...props.filters, cityId })}
        items={props.cities}
        getValue={(x) => x.cityId}
        getLabel={(x) => x.cityName}
        placeholder="City"
      />
      <div className="grid grid-cols-2 gap-2">
        <input
          value={props.filters.minPrice}
          onChange={(e) => props.onChange({ ...props.filters, minPrice: e.target.value })}
          placeholder="Min price"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
        />
        <input
          value={props.filters.maxPrice}
          onChange={(e) => props.onChange({ ...props.filters, maxPrice: e.target.value })}
          placeholder="Max price"
          className="rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#F97316]"
        />
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block lg:col-span-3">
        <div className="sticky top-28 rounded-2xl border border-gray-200 bg-white p-4">{body}</div>
      </aside>
      {props.open && (
        <div className="fixed inset-0 z-[120] bg-black/40 lg:hidden" onClick={props.onClose}>
          <div
            className="absolute left-0 top-0 h-full w-[88%] max-w-sm overflow-y-auto bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Filters</h3>
              <button onClick={props.onClose} className="rounded-full p-2 hover:bg-gray-100">
                <FiX />
              </button>
            </div>
            {body}
          </div>
        </div>
      )}
    </>
  );
}

