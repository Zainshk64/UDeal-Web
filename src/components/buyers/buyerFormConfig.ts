import type { BuyerDropdownOption } from '@/src/api/services/buyerPostApi';

export type FieldType =
  | 'text'
  | 'number'
  | 'textarea'
  | 'dropdown'
  | 'phone'
  | 'checkbox'
  | 'range';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  dependsOn?: string;
  fetchOptions?: string;
  fetchParam?: string;
  options?: BuyerDropdownOption[];
  rangeFields?: { from: string; to: string };
}

const opt = (pairs: [number, string][]): BuyerDropdownOption[] =>
  pairs.map(([id, name]) => ({ id, name }));

export const EXCLUDED_FIELDS_BY_SUBCATEGORY: Record<number, string[]> = {
  1: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  2: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  3: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  4: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  5: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  6: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  7: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  8: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  10: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  11: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  12: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  13: ['TransId', 'Mileage', 'ColorId', 'CityId'],
  14: ['BedRooms', 'Washrooms', 'IsFurnished', 'GreyStructure', 'Completed', 'Duration'],
  15: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  17: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  23: ['BedRooms', 'Washrooms', 'IsFurnished'],
  24: ['BedRooms', 'Washrooms'],
  19: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  21: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  22: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  26: ['Washrooms', 'IsFurnished', 'GreyStructure', 'Completed'],
  31: [],
  32: [],
  33: [],
  34: ['Washrooms'],
  35: ['BedRooms', 'Washrooms'],
  27: ['ColorId'],
  28: ['ColorId'],
  29: ['ColorId'],
  30: ['ColorId'],
  42: [],
  43: ['Storage', 'RAM', 'PTA'],
  44: ['Storage', 'PTA'],
  51: [],
  52: [],
  53: ['RAM', 'Storage', 'Processor'],
  54: ['RAM', 'Storage'],
  55: [],
  56: [],
  61: [],
  62: [],
  63: [],
  64: [],
  71: [],
  72: [],
  73: ['Breed', 'Age', 'Gender'],
  81: [],
  82: [],
  83: [],
  84: [],
  91: [],
  92: [],
  93: [],
  94: [],
};

export const INCLUDED_FIELDS_BY_SUBCATEGORY: Record<number, string[]> = {
  3: [
    'ProdcutTitle',
    'MakeId',
    'BrandId',
    'PriceRange',
    'ProvinceId',
    'CityId',
    'ProductDescription',
    'ContactNo',
    'ShowMyContactNo',
  ],
  13: [
    'ProdcutTitle',
    'MakeId',
    'BrandId',
    'PriceRange',
    'ProvinceId',
    'CityId',
    'ProductDescription',
    'ContactNo',
    'ShowMyContactNo',
  ],
};

const provinceCity = (): FormField[] => [
  {
    key: 'ProvinceId',
    label: 'Province',
    type: 'dropdown',
    fetchOptions: 'getProvinces',
    required: true,
  },
  {
    key: 'CityId',
    label: 'City',
    type: 'dropdown',
    dependsOn: 'ProvinceId',
    fetchOptions: 'getCitiesByProvince',
    required: true,
  },
];

const descContact = (): FormField[] => [
  {
    key: 'ProductDescription',
    label: 'Description',
    type: 'textarea',
    placeholder: "Describe what you're looking for...",
    required: true,
  },
  {
    key: 'ContactNo',
    label: 'Contact Number',
    type: 'phone',
    placeholder: '3XX-XXXXXXX',
    required: true,
  },
  {
    key: 'ShowMyContactNo',
    label: 'Show my contact number',
    type: 'checkbox',
  },
];

const priceRange = (label: string, required = true): FormField => ({
  key: 'PriceRange',
  label,
  type: 'range',
  rangeFields: { from: 'Price', to: 'PriceTo' },
  required,
});

/** Category 1 Vehicles */
const fieldsCat1 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for Honda Civic',
    required: true,
  },
  {
    key: 'MakeId',
    label: 'Make (Company)',
    type: 'dropdown',
    fetchOptions: 'getMakeCompanies',
    fetchParam: 'categoryId',
    required: true,
  },
  {
    key: 'BrandId',
    label: 'Model',
    type: 'dropdown',
    dependsOn: 'MakeId',
    fetchOptions: 'getBrands',
    required: true,
  },
  priceRange('Price Range (PKR)'),
  {
    key: 'YearRange',
    label: 'Model Year Range',
    type: 'range',
    rangeFields: { from: 'MYid', to: 'MYearToid' },
    fetchOptions: 'getMakeYears',
  },
  {
    key: 'FuelId',
    label: 'Fuel Type',
    type: 'dropdown',
    fetchOptions: 'getFuelTypes',
  },
  {
    key: 'TransId',
    label: 'Transmission',
    type: 'dropdown',
    fetchOptions: 'getTransmissions',
  },
  {
    key: 'EngineCapacity',
    label: 'Engine Capacity (cc)',
    type: 'number',
    placeholder: 'e.g., 1800',
  },
  {
    key: 'Mileage',
    label: 'Mileage (km)',
    type: 'number',
    placeholder: 'e.g., 50000',
  },
  {
    key: 'ColorId',
    label: 'Color',
    type: 'dropdown',
    fetchOptions: 'getColors',
  },
  ...provinceCity(),
  ...descContact(),
  {
    key: 'TermsAndAgreement',
    label: 'Terms and condition',
    type: 'checkbox',
  },
];

/** Category 2 Bikes — same as vehicles minus Terms line */
const fieldsCat2 = (): FormField[] => {
  const f = fieldsCat1().filter((x) => x.key !== 'TermsAndAgreement');
  return f;
};

/** Property sale 3 */
const fieldsCat3 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for 5 Marla House',
    required: true,
  },
  priceRange('Price Range (PKR)'),
  {
    key: 'UnitAreaId',
    label: 'Area Unit',
    type: 'dropdown',
    fetchOptions: 'getUnitAreas',
    required: true,
  },
  {
    key: 'AreaSizeRange',
    label: 'Area Size Range',
    type: 'range',
    rangeFields: { from: 'UnitAreaVal', to: 'UnitAreaValTo' },
  },
  {
    key: 'BedRooms',
    label: 'Bedrooms',
    type: 'dropdown',
    options: opt([
      [1, '1'],
      [2, '2'],
      [3, '3'],
      [4, '4'],
      [5, '5'],
      [6, '6+'],
    ]),
  },
  {
    key: 'Washrooms',
    label: 'Washrooms',
    type: 'dropdown',
    options: opt([
      [1, '1'],
      [2, '2'],
      [3, '3'],
      [4, '4'],
      [5, '5+'],
    ]),
  },
  { key: 'IsFurnished', label: 'Furnished', type: 'checkbox' },
  { key: 'GreyStructure', label: 'Grey Structure', type: 'checkbox' },
  { key: 'Completed', label: 'Completed', type: 'checkbox' },
  ...provinceCity(),
  ...descContact(),
];

/** Property rent 4 */
const fieldsCat4 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for 2 BHK Apartment',
    required: true,
  },
  priceRange('Rent Range (PKR/month)'),
  {
    key: 'UnitAreaId',
    label: 'Area Unit',
    type: 'dropdown',
    fetchOptions: 'getUnitAreas',
  },
  {
    key: 'AreaSizeRange',
    label: 'Area Size Range',
    type: 'range',
    rangeFields: { from: 'UnitAreaVal', to: 'UnitAreaValTo' },
  },
  {
    key: 'BedRooms',
    label: 'Bedrooms',
    type: 'dropdown',
    options: opt([
      [1, '1'],
      [2, '2'],
      [3, '3'],
      [4, '4'],
      [5, '5'],
      [6, '6+'],
    ]),
  },
  {
    key: 'Washrooms',
    label: 'Washrooms',
    type: 'dropdown',
    options: opt([
      [1, '1'],
      [2, '2'],
      [3, '3'],
      [4, '4'],
      [5, '5+'],
    ]),
  },
  { key: 'IsFurnished', label: 'Furnished', type: 'checkbox' },
  {
    key: 'Duration',
    label: 'Rental Duration',
    type: 'dropdown',
    options: opt([
      [1, '1 Month'],
      [3, '3 Months'],
      [6, '6 Months'],
      [12, '1 Year'],
      [24, '2 Years'],
    ]),
  },
  ...provinceCity(),
  ...descContact(),
];

/** Mobiles 5 */
const fieldsCat5 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for iPhone 14',
    required: true,
  },
  {
    key: 'MakeId',
    label: 'Brand',
    type: 'dropdown',
    fetchOptions: 'getMakeCompanies',
    fetchParam: 'categoryId',
  },
  priceRange('Price Range (PKR)'),
  {
    key: 'ColorId',
    label: 'Color',
    type: 'dropdown',
    fetchOptions: 'getColors',
  },
  ...provinceCity(),
  ...descContact(),
];

/** Electronics 6 */
const fieldsCat6 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for LED TV',
    required: true,
  },
  priceRange('Price Range (PKR)'),
  ...provinceCity(),
  ...descContact(),
];

/** Furniture 7, Fashion 9, Animals 8 — same shell */
const fieldsSimple = (titlePh: string): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: titlePh,
    required: true,
  },
  priceRange('Price Range (PKR)'),
  ...provinceCity(),
  ...descContact(),
];

/** Services 10 */
const fieldsCat10 = (): FormField[] => [
  {
    key: 'ProdcutTitle',
    label: 'Title',
    type: 'text',
    placeholder: 'e.g., Looking for Plumber',
    required: true,
  },
  priceRange('Budget Range (PKR)'),
  {
    key: 'Duration',
    label: 'Duration Needed',
    type: 'dropdown',
    options: opt([
      [1, 'One Time'],
      [2, 'Daily'],
      [3, 'Weekly'],
      [4, 'Monthly'],
      [5, 'Long Term'],
    ]),
  },
  ...provinceCity(),
  {
    key: 'ProductDescription',
    label: 'Description',
    type: 'textarea',
    placeholder: 'Describe what service you need...',
    required: true,
  },
  {
    key: 'ContactNo',
    label: 'Contact Number',
    type: 'phone',
    placeholder: '3XX-XXXXXXX',
    required: true,
  },
  {
    key: 'ShowMyContactNo',
    label: 'Show my contact number',
    type: 'checkbox',
  },
];

export const FORM_FIELDS_BY_CATEGORY: Record<number, FormField[]> = {
  1: fieldsCat1(),
  2: fieldsCat2(),
  3: fieldsCat3(),
  4: fieldsCat4(),
  5: fieldsCat5(),
  6: fieldsCat6(),
  7: fieldsSimple('e.g., Looking for Sofa Set'),
  8: fieldsSimple('e.g., Looking for Persian Cat'),
  9: fieldsSimple('e.g., Looking for fashion stuff'),
  10: fieldsCat10(),
};

export function getFilteredFields(
  _categoryId: number,
  subcategoryId: number,
  allFields: FormField[]
): FormField[] {
  const excluded = EXCLUDED_FIELDS_BY_SUBCATEGORY[subcategoryId] || [];
  if (!excluded.length) return allFields;
  return allFields.filter((f) => !excluded.includes(f.key));
}

export function getIncludedFields(subcategoryId: number, allFields: FormField[]): FormField[] {
  const keys = INCLUDED_FIELDS_BY_SUBCATEGORY[subcategoryId];
  if (!keys?.length) return allFields;
  return allFields.filter((f) => keys.includes(f.key));
}

export function resolveBuyerFormFields(categoryId: number, subcategoryId: number): FormField[] {
  const base = FORM_FIELDS_BY_CATEGORY[categoryId];
  if (!base?.length) return [];
  let f = getFilteredFields(categoryId, subcategoryId, base);
  f = getIncludedFields(subcategoryId, f);
  return f;
}
