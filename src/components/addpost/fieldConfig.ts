/** Field metadata for dynamic add-post form (aligned with mobile app keys). */

export type FieldConfigEntry = {
  label: string;
  type: 'text' | 'number' | 'dropdown' | 'textarea' | 'hidden';
  placeholder?: string;
  required?: boolean;
  keyboardType?: 'default' | 'numeric' | 'email-address';
  dropdownKey?: string;
  dependsOn?: string;
  apiLoader?: string;
  minLength?: number;
  hasRange?: boolean;
  rangeKey?: string;
};

export const FIELD_CONFIG: Record<string, FieldConfigEntry> = {
  ProdcutTitle: {
    label: 'Ad Title',
    type: 'text',
    placeholder: 'Enter a descriptive title',
    required: true,
    minLength: 5,
  },
  Price: {
    label: 'Price (PKR)',
    type: 'number',
    placeholder: 'Enter price',
    required: true,
    keyboardType: 'numeric',
    hasRange: true,
    rangeKey: 'priceRange',
  },
  ProductDescription: {
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe your item in detail...',
    required: true,
    minLength: 10,
  },
  CountryId: {
    label: 'Country',
    type: 'hidden',
  },
  ProvinceId: {
    label: 'Province',
    type: 'dropdown',
    placeholder: 'Select Province',
    required: true,
    dropdownKey: 'provinces',
  },
  CityId: {
    label: 'City',
    type: 'dropdown',
    placeholder: 'Select City',
    required: true,
    dependsOn: 'ProvinceId',
    apiLoader: 'getCitiesByProvince',
  },
  UnitAreaId: {
    label: 'Unit Area',
    type: 'dropdown',
    placeholder: 'Select Unit Area',
    required: true,
    dropdownKey: 'UnitAreas',
  },
  Area: {
    label: 'Area',
    type: 'text',
    placeholder: 'e.g: 3 ,4 ',
  },
  MakeCompanyId: {
    label: 'Make/Company',
    type: 'dropdown',
    placeholder: 'Select Make',
    required: true,
    apiLoader: 'getMakeCompanies',
  },
  BrandId: {
    label: 'Brand',
    type: 'dropdown',
    placeholder: 'Select Brand',
    required: true,
    dependsOn: 'MakeCompanyId',
    apiLoader: 'getBrands',
  },
  MakeYearId: {
    label: 'Year',
    type: 'dropdown',
    placeholder: 'Select Year',
    required: true,
    dropdownKey: 'makeYears',
  },
  IsFurnished: {
    label: 'Is Furnished',
    type: 'dropdown',
    placeholder: 'Select',
    required: true,
    dropdownKey: 'IsFurnished',
  },
  FuelId: {
    label: 'Fuel Type',
    type: 'dropdown',
    placeholder: 'Select Fuel Type',
    dropdownKey: 'fuelTypes',
  },
  TransId: {
    label: 'Transmission',
    type: 'dropdown',
    placeholder: 'Select Transmission',
    dropdownKey: 'transmissions',
  },
  ColorId: {
    label: 'Color',
    type: 'dropdown',
    placeholder: 'Select Color',
    dropdownKey: 'colors',
  },
  BrandName: {
    label: 'Brand Name',
    type: 'text',
    placeholder: 'Enter brand name',
    required: false,
  },
  ConditionId: {
    label: 'Condition',
    type: 'dropdown',
    placeholder: 'Select Condition',
    required: true,
    dropdownKey: 'conditions',
  },
  Mileage: {
    label: 'Mileage (KM)',
    type: 'number',
    placeholder: 'Enter mileage',
    keyboardType: 'numeric',
  },
  EngineCapacity: {
    label: 'Engine Capacity (cc)',
    type: 'number',
    placeholder: 'e.g. 1300',
    keyboardType: 'numeric',
  },
  EngineType: {
    label: 'Engine Type',
    type: 'text',
    placeholder: 'e.g. 4 Cylinder',
    required: false,
  },
  EngineAssembly: {
    label: 'Assembly',
    type: 'dropdown',
    placeholder: 'Select Assembly',
    dropdownKey: 'assemblies',
  },
  Documents: {
    label: 'Documents',
    type: 'dropdown',
    dropdownKey: 'documents',
    placeholder: 'Select Document Type',
  },
  NoOfOwners: {
    label: 'Number of Owners',
    type: 'number',
    placeholder: 'e.g. 1, 2',
    keyboardType: 'numeric',
    required: false,
  },
  Variant: {
    label: 'Variant',
    type: 'text',
    placeholder: 'e.g. VXR, GLI',
    required: false,
  },
  TotalSeats: {
    label: 'Total Seats',
    type: 'number',
    placeholder: 'e.g. 5',
    keyboardType: 'numeric',
  },
  Marla: {
    label: 'Size (Marla)',
    type: 'number',
    placeholder: 'Enter size in Marla',
    keyboardType: 'numeric',
  },
  PropertyType: {
    label: 'Property Type',
    type: 'dropdown',
    dropdownKey: 'propertyTypes',
    placeholder: 'Select Property Type',
  },
  Floors: {
    label: 'Floors',
    type: 'number',
    placeholder: 'Number of floors',
    keyboardType: 'numeric',
  },
  Bedrooms: {
    label: 'Bedrooms',
    type: 'number',
    placeholder: 'Number of bedrooms',
    keyboardType: 'numeric',
  },
  Washrooms: {
    label: 'Washrooms',
    type: 'number',
    placeholder: 'Number of washrooms',
    keyboardType: 'numeric',
  },
  UtilitiesAvailable: {
    label: 'Utilities Available',
    type: 'text',
    dropdownKey: 'utilities',
    placeholder: 'Select Utilities',
  },
  SecurityDeposit: {
    label: 'Security Deposit',
    type: 'number',
    placeholder: 'Enter amount',
    keyboardType: 'numeric',
  },
  LeaseDuration: {
    label: 'Lease Duration',
    type: 'text',
    placeholder: 'e.g. 1 Year',
    required: false,
  },
  MonthlyRent: {
    label: 'Monthly Rent',
    type: 'number',
    placeholder: 'Enter monthly rent',
    keyboardType: 'numeric',
  },
  Warranty: {
    label: 'Warranty',
    type: 'dropdown',
    dropdownKey: 'warranty',
    placeholder: 'Select Warranty',
  },
  ScreenSize: {
    label: 'Screen Size',
    type: 'text',
    placeholder: 'e.g. 6.5 inches',
    required: false,
  },
  RAM: {
    label: 'RAM',
    type: 'text',
    placeholder: 'Select RAM',
    dropdownKey: 'ramOptions',
  },
  Storage: {
    label: 'Storage',
    type: 'text',
    placeholder: 'Select Storage',
    dropdownKey: 'storageOptions',
  },
  Processor: {
    label: 'Processor',
    type: 'text',
    placeholder: 'e.g. Intel i5 / AMD Ryzen 5 / Apple M1 / Snapdragon 8 Gen 2',
  },
  OS: {
    label: 'Operating System',
    type: 'text',
    placeholder: 'e.g. Windows 11 / macOS / Linux / Android / iOS',
  },
  Material: {
    label: 'Material',
    type: 'text',
    placeholder: 'e.g. Wood, Metal, Plastic',
  },
  Size: {
    label: 'Size',
    type: 'text',
    placeholder: 'e.g. M, L, XL',
    required: false,
  },
  TypeSpecies: {
    label: 'Type/Species',
    type: 'text',
    placeholder: 'e.g. Dog, Cat, Bird',
  },
  Breed: {
    label: 'Breed',
    type: 'text',
    placeholder: 'Enter breed',
    required: false,
  },
  Age: {
    label: 'Age',
    type: 'text',
    placeholder: 'e.g. 2 Years',
  },
  Gender: {
    label: 'Gender',
    type: 'dropdown',
    placeholder: 'Select Gender',
  },
  ModelName: {
    label: 'Model Name',
    type: 'text',
    placeholder: 'Enter model name',
    required: false,
  },
  ProviderName: {
    label: 'Provider/Seller Name',
    type: 'text',
    placeholder: 'Enter your name',
  },
  ContactInfo: {
    label: 'Contact Info',
    type: 'text',
    placeholder: 'Phone or email',
  },
  AvailabilityHours: {
    label: 'Availability Hours',
    type: 'text',
    placeholder: 'e.g. 9 AM - 5 PM',
  },
  ServiceType: {
    label: 'Service Type',
    type: 'text',
    placeholder: 'e.g. Home Service, Shop',
  },
  Duration: {
    label: 'Duration',
    type: 'text',
    placeholder: 'e.g. 2 Hours',
  },
  DownPayment: {
    label: 'Down Payment',
    type: 'number',
    placeholder: 'Enter amount',
    keyboardType: 'numeric',
  },
  InstallmentPlan: {
    label: 'Installment Plan',
    type: 'text',
    placeholder: 'e.g. 12 Months',
  },
  MonthlyInstallment: {
    label: 'Monthly Installment',
    type: 'number',
    placeholder: 'Enter amount',
    keyboardType: 'numeric',
  },
  InterestMarkup: {
    label: 'Interest/Markup',
    type: 'text',
    placeholder: 'e.g. 10%',
  },
  Model: {
    label: 'Model',
    type: 'text',
    placeholder: 'Enter model',
  },
};

export const getFieldConfig = (fieldName: string): FieldConfigEntry => {
  return (
    FIELD_CONFIG[fieldName] || {
      label: fieldName
        .replace(/Id$/, '')
        .replace(/([A-Z])/g, ' $1')
        .trim(),
      type: 'text',
      placeholder: `Enter ${fieldName.replace(/Id$/, '')}`,
    }
  );
};

export const SKIP_FIELDS = ['CountryId', 'Id', 'CatId', 'SubCatId'];

export const DROPDOWN_FIELDS = [
  'ProvinceId',
  'CityId',
  'UnitAreaId',
  'MakeCompanyId',
  'BrandId',
  'MakeYearId',
  'IsFurnished',
  'FuelId',
  'TransId',
  'Documents',
  'Warranty',
  'PropertyType',
  'UtilitiesAvailable',
  'RAM',
  'Storage',
  'ColorId',
  'ConditionId',
  'RegCityId',
  'EngineAssembly',
  'Gender',
];

export type DropdownOption = { id: string | number; name: string };

export const GENDER_OPTIONS: DropdownOption[] = [
  { id: 'Male', name: 'Male' },
  { id: 'Female', name: 'Female' },
];

export const ASSEMBLY_OPTIONS: DropdownOption[] = [
  { id: 'Local', name: 'Local' },
  { id: 'Imported', name: 'Imported' },
];

export const DOCUMENTS_OPTIONS: DropdownOption[] = [
  { id: 'Original', name: 'Original' },
  { id: 'Duplicate', name: 'Duplicate' },
];

export const WARRANTY_OPTIONS: DropdownOption[] = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
];

export const RAM_OPTIONS: DropdownOption[] = [
  { id: '2Gb', name: '2Gb' },
  { id: '4Gb', name: '4Gb' },
  { id: '8Gb', name: '8Gb' },
  { id: '16Gb', name: '16Gb' },
  { id: '32Gb', name: '32Gb' },
  { id: '64Gb', name: '64Gb' },
  { id: '128Gb', name: '128Gb' },
  { id: '256Gb', name: '256Gb' },
  { id: '512Gb', name: '512Gb' },
];

export const PROPERTYTYPE_OPTIONS: DropdownOption[] = [
  { id: 'Residential', name: 'Residential' },
  { id: 'Commercial', name: 'Commercial' },
  { id: 'On Lease', name: 'On Lease' },
];

export const UTILITIES_OPTIONS: DropdownOption[] = [
  { id: 'All', name: 'All' },
  { id: 'Gas', name: 'Gas' },
  { id: 'Electricity', name: 'Electricity' },
  { id: 'Water', name: 'Water' },
];

export const ISFURNISHED_OPTIONS: DropdownOption[] = [
  { id: 'Yes', name: 'Yes' },
  { id: 'No', name: 'No' },
];
