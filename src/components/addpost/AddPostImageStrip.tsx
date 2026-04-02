'use client';

import React, { useEffect, useRef, useState } from 'react';
import { FiPlus, FiX, FiImage } from 'react-icons/fi';

const MAX_IMAGES = 10;

export type AddPostImageStripProps = {
  files: File[];
  mainIndex: number;
  onFilesChange: (files: File[]) => void;
  onMainIndexChange: (index: number) => void;
  disabled?: boolean;
};

export function AddPostImageStrip({
  files,
  mainIndex,
  onFilesChange,
  onMainIndexChange,
  disabled,
}: AddPostImageStripProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files]);

  const handlePick = (list: FileList | null) => {
    if (!list?.length || disabled) return;
    const next = [...files];
    for (let i = 0; i < list.length && next.length < MAX_IMAGES; i++) {
      const f = list[i];
      if (!f.type.startsWith('image/')) continue;
      next.push(f);
    }
    onFilesChange(next);
    if (files.length === 0 && next.length > 0) onMainIndexChange(0);
  };

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    onFilesChange(next);
    if (next.length === 0) {
      onMainIndexChange(0);
      return;
    }
    if (mainIndex === idx) onMainIndexChange(0);
    else if (mainIndex > idx) onMainIndexChange(mainIndex - 1);
  };

  const setCover = (idx: number) => {
    if (disabled) return;
    onMainIndexChange(idx);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Photos</h3>
          <p className="text-xs text-slate-500">
            Add 1–{MAX_IMAGES} images. Click a thumbnail to set the cover image.
          </p>
        </div>
        <span className="text-xs font-medium text-slate-600">
          {files.length} / {MAX_IMAGES}
        </span>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 pt-0.5 [scrollbar-width:thin]">
        {files.map((file, i) => (
          <div
            key={`${file.name}-${i}-${file.size}`}
            className={`group relative h-28 w-28 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition-colors ${
              mainIndex === i
                ? 'border-amber-500 ring-2 ring-amber-200'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <button
              type="button"
              onClick={() => setCover(i)}
              className="relative block h-full w-full"
              aria-label={mainIndex === i ? 'Cover image' : 'Set as cover image'}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrls[i]}
                alt=""
                className="h-full w-full object-cover"
              />
              {mainIndex === i && (
                <span className="absolute bottom-1 left-1 rounded bg-amber-600 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                  Cover
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => removeAt(i)}
              disabled={disabled}
              className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/55 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              aria-label="Remove image"
            >
              <FiX className="h-4 w-4" />
            </button>
          </div>
        ))}

        {files.length < MAX_IMAGES && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500 transition-colors hover:border-amber-400 hover:bg-amber-50/50 hover:text-amber-800 disabled:opacity-50"
          >
            <FiPlus className="h-7 w-7" />
            <span className="text-xs font-medium">Add</span>
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={disabled}
          onChange={(e) => {
            handlePick(e.target.files);
            e.target.value = '';
          }}
        />
      </div>

      {files.length === 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <FiImage className="h-4 w-4 shrink-0" />
          At least one photo is required before you can publish.
        </div>
      )}
    </div>
  );
}
