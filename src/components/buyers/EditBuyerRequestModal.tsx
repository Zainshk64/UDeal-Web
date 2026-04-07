'use client';

import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { BuyerRequest } from '@/src/api/services/buyerPostApi';
import { updateBuyerRequestFromListRow } from '@/src/api/services/buyerPostApi';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: BuyerRequest | null;
  userId: number;
  onSaved: (updated: BuyerRequest) => void;
};

export function EditBuyerRequestModal({ open, onOpenChange, row, userId, onSaved }: Props) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');
  const [duration, setDuration] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!row || !open) return;
    setTitle(row.prodcutTitle?.trim() || '');
    setDescription(row.productDescription?.trim() || '');
    setPriceFrom(row.price != null ? String(row.price) : '');
    setPriceTo(row.priceTo != null ? String(row.priceTo) : '');
    setDuration((row.duration ?? '').trim());
  }, [row, open]);

  const handleSave = async () => {
    if (!row) return;
    const t = title.trim();
    if (!t) return;
    const p1 = Number(priceFrom);
    const p2 = Number(priceTo);
    if (!Number.isFinite(p1) || !Number.isFinite(p2)) return;
    setSaving(true);
    const res = await updateBuyerRequestFromListRow(row, userId, {
      ProdcutTitle: t,
      ProductDescription: description.trim(),
      Price: p1,
      PriceTo: p2,
      Duration: duration.trim(),
    });
    setSaving(false);
    if (res.success) {
      onSaved({
        ...row,
        prodcutTitle: t,
        productDescription: description.trim(),
        price: p1,
        priceTo: p2,
        duration: duration.trim() || null,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,720px)] overflow-y-auto sm:max-w-lg"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Edit request</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-gray-800">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 outline-none focus:border-[#F97316]"
              placeholder="What are you looking for?"
            />
          </label>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-gray-800">Description</span>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-y rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 outline-none focus:border-[#F97316]"
              placeholder="Details sellers should know"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-gray-800">Price from</span>
              <input
                type="number"
                min={0}
                value={priceFrom}
                onChange={(e) => setPriceFrom(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 outline-none focus:border-[#F97316]"
              />
            </label>
            <label className="grid gap-1.5 text-sm">
              <span className="font-medium text-gray-800">Price to</span>
              <input
                type="number"
                min={0}
                value={priceTo}
                onChange={(e) => setPriceTo(e.target.value)}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 outline-none focus:border-[#F97316]"
              />
            </label>
          </div>

          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-gray-800">Duration</span>
            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-gray-900 outline-none focus:border-[#F97316]"
              placeholder="e.g. 2 weeks, Until sold"
            />
          </label>

          {/* Future fields — uncomment and map in updateBuyerRequestFromListRow when needed:
          <label className="grid gap-1.5 text-sm">
            <span className="font-medium text-gray-800">Contact number</span>
            <input className="rounded-xl border ..." />
          </label>
          */}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={
              saving ||
              !title.trim() ||
              !Number.isFinite(Number(priceFrom)) ||
              !Number.isFinite(Number(priceTo))
            }
            onClick={handleSave}
            className="rounded-xl bg-[#F97316] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ea580c] disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
