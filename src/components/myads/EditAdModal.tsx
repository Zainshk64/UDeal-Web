'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiEdit3, FiSave, FiInfo, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'sonner';

import {
  getProductForEdit,
  updateProduct,
  upsertProductPictures,
  UpsertImageItem,
} from '@/src/api/services/EditAd/EditAdApi';
import {
  getProductForm,
  getCities,
  getCitiesByProvince,
  getMakeCompanies,
  getBrands,
  DropdownOption,
  FormFieldResponse,
} from '@/src/api/services/EditAd/FormFieldApi';
import { useAuth } from '@/src/context/AuthContext';
import {
  EditImageManager,
  ExistingImage,
  NewImage,
} from '@/src/components/EditAd/EditImageManager';
import { DropdownSelect } from '@/src/components/EditAd/DropdownSelect';
import {
  EXCLUDED_FIELDS,
  DROPDOWN_FIELDS,
  STATIC_DROPDOWNS,
  getFieldConfig,
} from '@/src/components/EditAd/EditFieldConfig';
import { checkImagesSafe } from '@/src/utils/imageCheck';
import { getImageUrl } from '@/src/utils/image';
import { cn } from '@/src/utils/cn';

interface EditAdModalProps {
  open: boolean;
  productId: number | null;
  onClose: () => void;
  onSaved: () => void;
}

export const EditAdModal: React.FC<EditAdModalProps> = ({
  open,
  productId,
  onClose,
  onSaved,
}) => {
  const { user } = useAuth();

  // Loading states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingStep, setSavingStep] = useState('');

  // Product data
  const [catId, setCatId] = useState(0);
  const [subCatId, setSubCatId] = useState(0);

  // Images
  const [existingImages, setExistingImages] = useState<ExistingImage[]>([]);
  const [newImages, setNewImages] = useState<NewImage[]>([]);
  const [originalImages, setOriginalImages] = useState<ExistingImage[]>([]);

  // Form
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [originalFormData, setOriginalFormData] = useState<Record<string, any>>({});
  const [selectedNames, setSelectedNames] = useState<Record<string, string>>({});
  const [formFields, setFormFields] = useState<FormFieldResponse>({ activeFields: [] });
  const [dropdownData, setDropdownData] = useState<any>({});

  // Dropdown state
  const [dropdownOptions, setDropdownOptions] = useState<Record<string, DropdownOption[]>>({});
  const [dropdownLoading, setDropdownLoading] = useState<string | null>(null);

  // Reset everything when modal opens/closes
  useEffect(() => {
    if (!open) {
      setLoading(true);
      setFormData({});
      setOriginalFormData({});
      setSelectedNames({});
      setExistingImages([]);
      setNewImages([]);
      setOriginalImages([]);
      setFormFields({ activeFields: [] });
      return;
    }

    if (open && productId && user?.userId) {
      fetchProductData();
    }
  }, [open, productId, user?.userId]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // Fetch product data
  const fetchProductData = async () => {
    if (!productId || !user?.userId) return;
    setLoading(true);

    try {
      const productRes = await getProductForEdit(productId, user.userId);
      if (!productRes?.Details?.[0]) {
        toast.error('Product not found');
        onClose();
        return;
      }

      const detail = productRes.Details[0];
      setCatId(detail.CatId);
      setSubCatId(detail.SubCatId);

      // Images
      const pics: ExistingImage[] = (productRes.Pictures || []).map((pic: any) => ({
        picId: pic.PicId,
        picPath: pic.PicPath,
        isMain: pic.IsMainPic,
        isDeleted: false,
      }));
      setExistingImages(pics);
      setOriginalImages(JSON.parse(JSON.stringify(pics)));

      // Form fields
      const formRes = await getProductForm(detail.CatId, detail.SubCatId);
      setFormFields(formRes);
      setDropdownData(formRes);

      // Initialize form data
      const initData: Record<string, any> = {};
      const initNames: Record<string, string> = {};

      Object.keys(detail).forEach((key) => {
        if (!EXCLUDED_FIELDS.includes(key) && detail[key] !== null) {
          if (key.endsWith('Id') && detail[key]) {
            initData[key] = detail[key];
            const nameKey = key.replace('Id', 'Name');
            if (detail[nameKey]) initNames[key] = detail[nameKey];
          } else if (!key.endsWith('Name')) {
            initData[key] = detail[key];
          }
        }
      });

      // Map display names
      const nameMap: Record<string, string> = {
        CityId: 'CityName', BrandId: 'BrandName', MakeCompanyId: 'MakeCompany',
        ColorId: 'ColorName', FuelId: 'FuelName', TransId: 'TransName',
        ConditionId: 'ConditionName', MakeYearId: 'MakeYear',
        ProvinceId: 'ProvinceName', RegCityId: 'RegCityName',
      };

      Object.entries(nameMap).forEach(([idKey, nameKey]) => {
        if (detail[nameKey]) initNames[idKey] = detail[nameKey];
      });

      setFormData(initData);
      setOriginalFormData(JSON.parse(JSON.stringify(initData)));
      setSelectedNames(initNames);
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error('Failed to load product');
    }

    setLoading(false);
  };

  // Change detection
  const hasFormChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(originalFormData);
  }, [formData, originalFormData]);

  const hasImageChanges = useMemo(() => {
    const hasDeleted = existingImages.some((img) => img.isDeleted);
    const hasNew = newImages.length > 0;
    const origMain = originalImages.find((img) => img.isMain)?.picId;
    const currMain = existingImages.find((img) => img.isMain && !img.isDeleted)?.picId;
    return hasDeleted || hasNew || origMain !== currMain;
  }, [existingImages, newImages, originalImages]);

  const hasChanges = hasFormChanges || hasImageChanges;

  // Active fields
  const activeFieldNames = useMemo(() => {
    const fields = formFields.activeFields
      .map((f) => f.FieldName)
      .filter((name) => !EXCLUDED_FIELDS.includes(name) && !name.endsWith('Name'));

    if (fields.length === 0) {
      return ['ProdcutTitle', 'Price', 'ProductDescription', 'Address'];
    }
    return fields;
  }, [formFields]);

  // Handle text change
  const handleTextChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load dropdown options
  const loadDropdownOptions = async (fieldName: string): Promise<DropdownOption[]> => {
    if (fieldName === 'EngineAssembly') return STATIC_DROPDOWNS.assemblies;
    if (fieldName === 'Documents') return STATIC_DROPDOWNS.documents;
    if (fieldName === 'Gender') return STATIC_DROPDOWNS.genders;

    if (fieldName === 'ProvinceId' && dropdownData.provinces)
      return dropdownData.provinces.map((p: any) => ({ id: p.Id, name: p.Name }));
    if (fieldName === 'MakeYearId' && dropdownData.makeYears)
      return dropdownData.makeYears.map((y: any) => ({ id: y.Id, name: y.Name }));
    if (fieldName === 'FuelId' && dropdownData.fuelTypes)
      return dropdownData.fuelTypes.map((f: any) => ({ id: f.Id, name: f.Name }));
    if (fieldName === 'TransId' && dropdownData.transmissions)
      return dropdownData.transmissions.map((t: any) => ({ id: t.Id, name: t.Name }));
    if (fieldName === 'ColorId' && dropdownData.colors)
      return dropdownData.colors.map((c: any) => ({ id: c.Id, name: c.Name }));
    if (fieldName === 'ConditionId' && dropdownData.conditions)
      return dropdownData.conditions.map((c: any) => ({ id: c.Id, name: c.Name }));

    if (fieldName === 'CityId') {
      if (!formData.ProvinceId) { toast.info('Select province first'); return []; }
      return await getCitiesByProvince(formData.ProvinceId);
    }
    if (fieldName === 'RegCityId') return await getCities();
    if (fieldName === 'MakeCompanyId') return await getMakeCompanies(catId);
    if (fieldName === 'BrandId') {
      if (!formData.MakeCompanyId) { toast.info('Select make first'); return []; }
      return await getBrands(formData.MakeCompanyId);
    }

    return [];
  };

  const handleDropdownOpen = async (fieldName: string) => {
    if (dropdownOptions[fieldName]?.length) return; // Already loaded
    setDropdownLoading(fieldName);
    const options = await loadDropdownOptions(fieldName);
    setDropdownOptions((prev) => ({ ...prev, [fieldName]: options }));
    setDropdownLoading(null);
  };

  const handleDropdownSelect = (fieldName: string, option: DropdownOption) => {
    setFormData((prev) => ({ ...prev, [fieldName]: option.id }));
    setSelectedNames((prev) => ({ ...prev, [fieldName]: option.name }));

    // Clear dependent fields
    if (fieldName === 'ProvinceId') {
      setFormData((prev) => ({ ...prev, CityId: undefined }));
      setSelectedNames((prev) => ({ ...prev, CityId: '' }));
      setDropdownOptions((prev) => ({ ...prev, CityId: [] }));
    }
    if (fieldName === 'MakeCompanyId') {
      setFormData((prev) => ({ ...prev, BrandId: undefined }));
      setSelectedNames((prev) => ({ ...prev, BrandId: '' }));
      setDropdownOptions((prev) => ({ ...prev, BrandId: [] }));
    }
  };

  // SAVE HANDLER
  const handleSave = async () => {
    if (!productId || !user?.userId) return;

    // Validate
    if (!formData.ProdcutTitle?.toString().trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.Price) {
      toast.error('Price is required');
      return;
    }

    const activeExisting = existingImages.filter((img) => !img.isDeleted);
    if (activeExisting.length + newImages.length === 0) {
      toast.error('At least 1 image is required');
      return;
    }

    setSaving(true);
    let formSuccess = true;
    let imageSuccess = true;
    let imagesAreSafe = true;
    let apiResponseMessage = 'PASSED';

    // Step 1: Check new images safety
    if (newImages.length > 0) {
      setSavingStep('Scanning new photos...');
      const newFiles = newImages.map((img) => img.file);
      const scanResult = await checkImagesSafe(newFiles);
      imagesAreSafe = scanResult.isSafe;
      apiResponseMessage = imagesAreSafe ? 'PASSED' : `BLOCKED: ${scanResult.reasons.join(', ')}`;
    }

    // Step 2: Update form fields
    if (hasFormChanges || newImages.length > 0) {
      setSavingStep('Updating ad details...');

      const updateData: Record<string, any> = {
        ...formData,
        CreatedByUid: user.userId,
        SubCatId: subCatId,
        CountryId: 1,
        Enable: imagesAreSafe,
        ApiResponse: apiResponseMessage,
      };

      // Convert string numbers
      ['Price', 'Mileage', 'EngineCapacity', 'NoOfOwners', 'TotalSeats', 'Marla', 'Floors', 'SecurityDeposit', 'MonthlyRent', 'DownPayment', 'MonthlyInstallment'].forEach((key) => {
        if (updateData[key]) updateData[key] = Number(updateData[key]);
      });

      formSuccess = await updateProduct(productId, catId, updateData);
    }

    // Step 3: Update images
    if (hasImageChanges) {
      setSavingStep('Updating photos...');

      const allImages: UpsertImageItem[] = [];

      // Existing kept images
      activeExisting.forEach((img) => {
        allImages.push({
          file: getImageUrl(img.picPath),
          isMain: img.isMain,
          isExisting: true,
        });
      });

      // New images
      newImages.forEach((img) => {
        allImages.push({
          file: img.file,
          isMain: img.isMain,
          isExisting: false,
        });
      });

      imageSuccess = await upsertProductPictures(productId, user.userId, allImages);
    }

    setSaving(false);
    setSavingStep('');

    // Result
    if (formSuccess && imageSuccess) {
      if (!imagesAreSafe) {
        toast.warning('Ad Updated (Pending Review)', {
          description: 'New photos flagged for review.',
        });
      } else {
        toast.success('Success!', {
          description: 'Your ad has been updated.',
        });
      }
      onSaved();
      onClose();
    } else if (!formSuccess) {
      toast.error('Failed to update ad details');
    } else if (!imageSuccess) {
      toast.error('Failed to update photos', {
        description: 'Other changes were saved.',
      });
    }
  };

  // Render field
  const renderField = (fieldName: string) => {
    const config = getFieldConfig(fieldName);
    const isDropdown = DROPDOWN_FIELDS.includes(fieldName);
    const value = formData[fieldName];

    if (isDropdown) {
      return (
        <DropdownSelect
          key={fieldName}
          label={config.label}
          value={value}
          displayValue={selectedNames[fieldName] || ''}
          placeholder={config.placeholder}
          required={config.required}
          options={dropdownOptions[fieldName] || []}
          loading={dropdownLoading === fieldName}
          onOpen={() => handleDropdownOpen(fieldName)}
          onSelect={(opt) => handleDropdownSelect(fieldName, opt)}
        />
      );
    }

    if (config.type === 'textarea') {
      return (
        <div key={fieldName}>
          <label className="text-gray-700 font-semibold text-sm mb-1.5 block">
            {config.label}
            {config.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={value?.toString() || ''}
            onChange={(e) => handleTextChange(fieldName, e.target.value)}
            placeholder={config.placeholder}
            rows={4}
            className={cn(
              'w-full border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent',
              value ? 'border-green-400' : 'border-gray-300'
            )}
          />
        </div>
      );
    }

    return (
      <div key={fieldName}>
        <label className="text-gray-700 font-semibold text-sm mb-1.5 block">
          {config.label}
          {config.required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <input
          type={config.inputType || 'text'}
          value={value?.toString() || ''}
          onChange={(e) => handleTextChange(fieldName, e.target.value)}
          placeholder={config.placeholder}
          className={cn(
            'w-full border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#F97316] focus:border-transparent',
            value ? 'border-green-400' : 'border-gray-300'
          )}
        />
      </div>
    );
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-start justify-center overflow-y-auto"
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/60" onClick={() => !saving && onClose()} />

        {/* Modal */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative bg-white w-full max-w-2xl mx-4 my-8 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gradient-to-r from-[#003049] to-[#004d6d] px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FiEdit3 className="w-5 h-5 text-white" />
              <h2 className="text-lg font-bold text-white">Edit Ad</h2>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className={cn(
                  'px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors',
                  saving || !hasChanges
                    ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                    : 'bg-[#F97316] text-white hover:bg-[#ea580c]'
                )}
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => !saving && onClose()}
                disabled={saving}
                className="p-2 hover:bg-white/10 rounded-lg text-white disabled:opacity-50"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Saving Progress */}
          {saving && savingStep && (
            <div className="bg-blue-50 border-b border-blue-100 px-6 py-2 flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-blue-700 text-sm font-medium">{savingStep}</span>
            </div>
          )}

          {/* Body */}
          <div className="max-h-[70vh] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-3 border-gray-300 border-t-[#F97316] rounded-full animate-spin mb-4" />
                <p className="text-gray-500">Loading ad details...</p>
              </div>
            ) : (
              <div className="px-6 py-6 space-y-6">
                {/* Image Manager */}
                <EditImageManager
                  existingImages={existingImages}
                  newImages={newImages}
                  onExistingChange={setExistingImages}
                  onNewChange={setNewImages}
                  maxImages={10}
                  disabled={saving}
                />

                {/* Changes Indicator */}
                {hasChanges && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-2">
                    <FiInfo className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-blue-700 text-sm">You have unsaved changes</span>
                  </div>
                )}

                {/* Category Notice */}
                <div className="bg-gray-100 rounded-xl p-3 flex items-center gap-2">
                  <FiInfo className="w-4 h-4 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-600 text-xs">Category and subcategory cannot be changed</span>
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-5">
                  {activeFieldNames.map((fieldName) => renderField(fieldName))}
                </div>

                {/* Bottom Save */}
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className={cn(
                    'w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-colors',
                    saving || !hasChanges
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#F97316] hover:bg-[#ea580c]'
                  )}
                >
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiCheckCircle className="w-5 h-5" />
                      {hasChanges ? 'Save Changes' : 'No Changes'}
                    </>
                  )}
                </button>

                <button
                  onClick={() => !saving && onClose()}
                  disabled={saving}
                  className="w-full py-3 text-gray-500 text-center font-medium hover:text-gray-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};