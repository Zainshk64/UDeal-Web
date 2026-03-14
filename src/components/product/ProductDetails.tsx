'use client';

import React from 'react';
import { FiList } from 'react-icons/fi';
import { ProductDetail } from '@/src/api/services/HomeApi';
import { cn } from '@/src/utils/cn';

interface ProductDetailsProps {
  detail: ProductDetail;
}

export const ProductDetailsSection: React.FC<ProductDetailsProps> = ({
  detail,
}) => {
  const detailRows = [
    { label: 'Category', value: detail.CategoryName },
    { label: 'Sub Category', value: detail.SubCategoryName },
    { label: 'Make Company', value: detail.MakeCompany },
    { label: 'Brand', value: detail.BrandName },
    { label: 'Model', value: detail.ModelName },
    { label: 'Variant', value: detail.Variant },
    { label: 'Condition', value: detail.ConditionName },
    {
      label: 'Price',
      value: detail.Price
        ? `PKR ${detail.Price.toLocaleString()}`
        : null,
    },
    { label: 'Down Payment', value: detail.DownPayment },
    { label: 'Monthly Installment', value: detail.MonthlyInstallment },
    { label: 'Installment Plan', value: detail.InstallmentPlan },
    { label: 'Interest Markup', value: detail.InterestMarkup },
    { label: 'Fuel Type', value: detail.FuelName },
    { label: 'Transmission', value: detail.TransName },
    { label: 'Color', value: detail.ColorName },
    { label: 'Engine Type', value: detail.EngineType },
    {
      label: 'Engine Capacity',
      value: detail.EngineCapacity
        ? `${detail.EngineCapacity} cc`
        : null,
    },
    { label: 'Engine Assembly', value: detail.EngineAssembly },
    {
      label: 'Mileage',
      value: detail.Mileage ? `${detail.Mileage} km` : null,
    },
    { label: 'Total Seats', value: detail.TotalSeats },
    { label: 'No. of Owners', value: detail.NoOfOwners },
    { label: 'Make Year', value: detail.MakeYear },
    { label: 'Registration City', value: detail.RegCityName },
    { label: 'Documents', value: detail.Documents },
    { label: 'Area (Marla)', value: detail.Marla },
    { label: 'Property Type', value: detail.PropertyType },
    { label: 'Floors', value: detail.Floors },
    { label: 'Utilities', value: detail.UtilitiesAvailable },
    { label: 'Security Deposit', value: detail.SecurityDeposit },
    { label: 'Lease Duration', value: detail.LeaseDuration },
    { label: 'Monthly Rent', value: detail.MonthlyRent },
    { label: 'Warranty', value: detail.Warranty },
    { label: 'Screen Size', value: detail.ScreenSize },
    { label: 'RAM', value: detail.RAM },
    { label: 'Storage', value: detail.Storage },
    { label: 'Processor', value: detail.Processor },
    { label: 'OS', value: detail.OS },
    { label: 'Battery Life', value: detail.BatteryLife },
    { label: 'Material', value: detail.Material },
    { label: 'Size', value: detail.Size },
    { label: 'Type / Species', value: detail.TypeSpecies },
    { label: 'Breed', value: detail.Breed },
    { label: 'Age', value: detail.Age },
    { label: 'Gender', value: detail.Gender },
    { label: 'Service Type', value: detail.ServiceType },
    { label: 'Duration', value: detail.Duration },
    { label: 'Provider Name', value: detail.ProviderName },
    { label: 'Contact Info', value: detail.ContactInfo },
    { label: 'Availability', value: detail.AvailabilityHours },
    { label: 'Country', value: detail.CountryName },
    { label: 'Province', value: detail.ProvinceName },
    { label: 'City', value: detail.CityName },
  ].filter(
    (item) =>
      item.value !== null &&
      item.value !== undefined &&
      item.value !== '' &&
      item.value !== 0
  );

  if (detailRows.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
          <FiList className="w-5 h-5 text-blue-500" />
        </div>
        <h3 className="text-lg font-bold text-[#003049]">
          Product Details
        </h3>
      </div>

      {/* Table */}
      <div className="bg-gray-50 rounded-2xl overflow-hidden">
        {detailRows.map((item, index) => (
          <div
            key={index}
            className={cn(
              'flex py-3.5 px-4',
              index < detailRows.length - 1 &&
                'border-b border-gray-200',
              index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
            )}
          >
            <span className="w-36 sm:w-44 text-gray-500 font-medium text-sm flex-shrink-0">
              {item.label}
            </span>
            <span className="flex-1 font-semibold text-gray-800 text-sm">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};