'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { FiPlus, FiX, FiStar, FiImage } from 'react-icons/fi';
import { getImageUrl } from '@/src/utils/image';

export interface ExistingImage {
  picId: number;
  picPath: string;
  isMain: boolean;
  isDeleted: boolean;
}

export interface NewImage {
  id: string;
  file: File;
  preview: string;
  isMain: boolean;
}

interface EditImageManagerProps {
  existingImages: ExistingImage[];
  newImages: NewImage[];
  onExistingChange: (images: ExistingImage[]) => void;
  onNewChange: (images: NewImage[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export const EditImageManager: React.FC<EditImageManagerProps> = ({
  existingImages,
  newImages,
  onExistingChange,
  onNewChange,
  maxImages = 10,
  disabled = false,
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const activeExisting = existingImages.filter((img) => !img.isDeleted);
  const totalActive = activeExisting.length + newImages.length;
  const canAdd = totalActive < maxImages;

  // Add new images
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - totalActive;
    const toAdd = files.slice(0, remaining);

    const newImgs: NewImage[] = toAdd.map((file) => ({
      id: `new_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      file,
      preview: URL.createObjectURL(file),
      isMain: totalActive === 0 && newImages.length === 0, // First image is main
    }));

    onNewChange([...newImages, ...newImgs]);

    // Reset input
    if (fileRef.current) fileRef.current.value = '';
  };

  // Delete existing image
  const deleteExisting = (picId: number) => {
    const updated = existingImages.map((img) =>
      img.picId === picId ? { ...img, isDeleted: true } : img
    );

    // If deleted image was main, set next available as main
    const wasMain = existingImages.find((img) => img.picId === picId)?.isMain;
    if (wasMain) {
      const nextExisting = updated.find((img) => !img.isDeleted);
      if (nextExisting) {
        const final = updated.map((img) => ({
          ...img,
          isMain: img.picId === nextExisting.picId,
        }));
        onExistingChange(final);
      } else if (newImages.length > 0) {
        onExistingChange(updated.map((img) => ({ ...img, isMain: false })));
        const updatedNew = newImages.map((img, i) => ({ ...img, isMain: i === 0 }));
        onNewChange(updatedNew);
      } else {
        onExistingChange(updated);
      }
    } else {
      onExistingChange(updated);
    }
  };

  // Delete new image
  const deleteNew = (id: string) => {
    const wasMain = newImages.find((img) => img.id === id)?.isMain;
    const filtered = newImages.filter((img) => img.id !== id);
    URL.revokeObjectURL(newImages.find((img) => img.id === id)?.preview || '');

    if (wasMain && filtered.length > 0) {
      filtered[0].isMain = true;
    } else if (wasMain && activeExisting.length > 0) {
      const updated = existingImages.map((img, i) => ({
        ...img,
        isMain: !img.isDeleted && i === existingImages.findIndex((x) => !x.isDeleted),
      }));
      onExistingChange(updated);
    }

    onNewChange(filtered);
  };

  // Set as cover
  const setCoverExisting = (picId: number) => {
    onExistingChange(existingImages.map((img) => ({ ...img, isMain: img.picId === picId })));
    onNewChange(newImages.map((img) => ({ ...img, isMain: false })));
  };

  const setCoverNew = (id: string) => {
    onExistingChange(existingImages.map((img) => ({ ...img, isMain: false })));
    onNewChange(newImages.map((img) => ({ ...img, isMain: img.id === id })));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FiImage className="w-5 h-5 text-gray-600" />
          <span className="font-semibold text-gray-700">Photos</span>
        </div>
        <span className="text-xs text-gray-500">{totalActive} / {maxImages}</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {/* Existing Images */}
        {activeExisting.map((img) => (
          <div key={img.picId} className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200 group">
            <Image
              src={getImageUrl(img.picPath)}
              alt="Product"
              fill
              className="object-cover"
            />

            {/* Cover Badge */}
            {img.isMain && (
              <div className="absolute top-1 left-1 bg-[#F97316] text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <FiStar className="w-3 h-3" /> Cover
              </div>
            )}

            {/* Actions Overlay */}
            {!disabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!img.isMain && (
                  <button
                    onClick={() => setCoverExisting(img.picId)}
                    className="p-1.5 bg-white rounded-full shadow text-[#F97316] hover:bg-[#F97316] hover:text-white transition-colors"
                    title="Set as cover"
                  >
                    <FiStar className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => deleteExisting(img.picId)}
                  className="p-1.5 bg-white rounded-full shadow text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  title="Remove"
                >
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* New Images */}
        {newImages.map((img) => (
          <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border-2 border-blue-300 group">
            <Image src={img.preview} alt="New" fill className="object-cover" />

            {img.isMain && (
              <div className="absolute top-1 left-1 bg-[#F97316] text-white px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1">
                <FiStar className="w-3 h-3" /> Cover
              </div>
            )}

            <div className="absolute top-1 right-1 bg-blue-500 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">
              NEW
            </div>

            {!disabled && (
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                {!img.isMain && (
                  <button onClick={() => setCoverNew(img.id)} className="p-1.5 bg-white rounded-full shadow text-[#F97316] hover:bg-[#F97316] hover:text-white" title="Set as cover">
                    <FiStar className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => deleteNew(img.id)} className="p-1.5 bg-white rounded-full shadow text-red-500 hover:bg-red-500 hover:text-white" title="Remove">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}

        {/* Add Button */}
        {canAdd && !disabled && (
          <button
            onClick={() => fileRef.current?.click()}
            className="aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#F97316] hover:text-[#F97316] transition-colors"
          >
            <FiPlus className="w-6 h-6" />
            <span className="text-[10px] font-medium">Add</span>
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
    </div>
  );
};