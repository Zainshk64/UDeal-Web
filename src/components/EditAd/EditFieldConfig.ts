export interface EditFieldConfig {
  label: string;
  type: 'text' | 'number' | 'textarea' | 'dropdown';
  placeholder?: string;
  inputType?: string;
  required?: boolean;
}

export const EXCLUDED_FIELDS = [
  'ProductId', 'CatId', 'SubCatId', 'CountryId',
  'CreatedDateTime', 'CreatedByUid', 'Enable', 'lt', 'lg',
  'MarkAsSold', 'IsFavorite', 'IsOwner', 'ProductType',
];

export const DROPDOWN_FIELDS = [
  'ProvinceId', 'CityId', 'MakeCompanyId', 'BrandId',
  'MakeYearId', 'FuelId', 'TransId', 'ColorId',
  'ConditionId', 'RegCityId', 'EngineAssembly', 'Documents', 'Gender',
];

export const FIELD_CONFIG: Record<string, EditFieldConfig> = {
  ProdcutTitle: { label: 'Ad Title', type: 'text', placeholder: 'Enter ad title', required: true },
  Price: { label: 'Price (PKR)', type: 'number', placeholder: 'Enter price', inputType: 'number', required: true },
  ProductDescription: { label: 'Description', type: 'textarea', placeholder: 'Describe your item...', required: true },
  Address: { label: 'Address / Location', type: 'text', placeholder: 'Enter address' },
  Area: { label: 'Area', type: 'text', placeholder: 'Enter area' },
  ProvinceId: { label: 'Province', type: 'dropdown' },
  CityId: { label: 'City', type: 'dropdown' },
  MakeCompanyId: { label: 'Make / Company', type: 'dropdown' },
  BrandId: { label: 'Model / Brand', type: 'dropdown' },
  MakeYearId: { label: 'Year', type: 'dropdown' },
  FuelId: { label: 'Fuel Type', type: 'dropdown' },
  TransId: { label: 'Transmission', type: 'dropdown' },
  ColorId: { label: 'Color', type: 'dropdown' },
  ConditionId: { label: 'Condition', type: 'dropdown' },
  RegCityId: { label: 'Registration City', type: 'dropdown' },
  EngineAssembly: { label: 'Assembly', type: 'dropdown' },
  Documents: { label: 'Documents', type: 'dropdown' },
  Gender: { label: 'Gender', type: 'dropdown' },
  Mileage: { label: 'Mileage (KM)', type: 'number', placeholder: 'Enter mileage', inputType: 'number' },
  EngineCapacity: { label: 'Engine Capacity (cc)', type: 'number', placeholder: 'e.g. 1300', inputType: 'number' },
  EngineType: { label: 'Engine Type', type: 'text', placeholder: 'e.g. 4 Cylinder' },
  NoOfOwners: { label: 'Number of Owners', type: 'number', placeholder: 'e.g. 1', inputType: 'number' },
  Variant: { label: 'Variant', type: 'text', placeholder: 'e.g. VXR, GLI' },
  TotalSeats: { label: 'Total Seats', type: 'number', placeholder: 'e.g. 5', inputType: 'number' },
  Model: { label: 'Model', type: 'text', placeholder: 'Enter model' },
  Marla: { label: 'Size (Marla)', type: 'number', placeholder: 'Enter size', inputType: 'number' },
  PropertyType: { label: 'Property Type', type: 'text', placeholder: 'e.g. House' },
  Floors: { label: 'Floors', type: 'number', placeholder: 'Number of floors', inputType: 'number' },
  UtilitiesAvailable: { label: 'Utilities', type: 'text', placeholder: 'e.g. Gas, Water' },
  SecurityDeposit: { label: 'Security Deposit', type: 'number', placeholder: 'Enter amount', inputType: 'number' },
  LeaseDuration: { label: 'Lease Duration', type: 'text', placeholder: 'e.g. 1 Year' },
  MonthlyRent: { label: 'Monthly Rent', type: 'number', placeholder: 'Enter rent', inputType: 'number' },
  Warranty: { label: 'Warranty', type: 'text', placeholder: 'e.g. 1 Year' },
  ScreenSize: { label: 'Screen Size', type: 'text', placeholder: 'e.g. 6.5 inches' },
  RAM: { label: 'RAM', type: 'text', placeholder: 'e.g. 8GB' },
  Storage: { label: 'Storage', type: 'text', placeholder: 'e.g. 128GB' },
  Processor: { label: 'Processor', type: 'text', placeholder: 'e.g. Snapdragon 888' },
  OS: { label: 'Operating System', type: 'text', placeholder: 'e.g. Android 13' },
  BatteryLife: { label: 'Battery', type: 'text', placeholder: 'e.g. 5000mAh' },
  Material: { label: 'Material', type: 'text', placeholder: 'e.g. Cotton' },
  Size: { label: 'Size', type: 'text', placeholder: 'e.g. M, L, XL' },
  TypeSpecies: { label: 'Type / Species', type: 'text', placeholder: 'e.g. Dog, Cat' },
  Breed: { label: 'Breed', type: 'text', placeholder: 'e.g. German Shepherd' },
  Age: { label: 'Age', type: 'text', placeholder: 'e.g. 2 Years' },
  ModelName: { label: 'Model Name', type: 'text', placeholder: 'Enter model name' },
  ProviderName: { label: 'Provider Name', type: 'text', placeholder: 'Your name' },
  ContactInfo: { label: 'Contact Info', type: 'text', placeholder: 'Phone or email' },
  AvailabilityHours: { label: 'Availability', type: 'text', placeholder: 'e.g. 9 AM - 5 PM' },
  ServiceType: { label: 'Service Type', type: 'text', placeholder: 'e.g. Home Service' },
  Duration: { label: 'Duration', type: 'text', placeholder: 'e.g. 2 Hours' },
  DownPayment: { label: 'Down Payment', type: 'number', placeholder: 'Enter amount', inputType: 'number' },
  InstallmentPlan: { label: 'Installment Plan', type: 'text', placeholder: 'e.g. 12 Months' },
  MonthlyInstallment: { label: 'Monthly Installment', type: 'number', placeholder: 'Enter amount', inputType: 'number' },
  InterestMarkup: { label: 'Interest / Markup', type: 'text', placeholder: 'e.g. 10%' },
};

export const getFieldConfig = (fieldName: string): EditFieldConfig => {
  return FIELD_CONFIG[fieldName] || {
    label: fieldName.replace(/Id$/, '').replace(/([A-Z])/g, ' $1').trim(),
    type: 'text',
    placeholder: `Enter ${fieldName}`,
  };
};

export const STATIC_DROPDOWNS: Record<string, { id: number; name: string }[]> = {
  assemblies: [{ id: 1, name: 'Local' }, { id: 2, name: 'Imported' }],
  documents: [{ id: 1, name: 'Original' }, { id: 2, name: 'Duplicate' }, { id: 3, name: 'Missing' }],
  genders: [{ id: 1, name: 'Male' }, { id: 2, name: 'Female' }],
};