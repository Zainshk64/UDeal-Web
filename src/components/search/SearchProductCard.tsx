'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FiClock, FiMapPin, FiStar } from 'react-icons/fi';
import { formatCurrency } from '@/src/utils/format';
import { getImageUrl } from '@/src/utils/image';

type BaseProduct = {
  ProductId: number;
  ProdcutTitle: string;
  ProductDescription: string;
  Price: number;
  Address: string;
  TimeAgo: string;
  PicPath?: string | null;
  MainPicPath?: string | null;
  ProductType?: string;
  IsFeatured?: boolean;
};

export function SearchProductCard({ product }: { product: BaseProduct }) {
  const isFeatured = product.ProductType === 'Featured' || product.IsFeatured;
  const pic = product.PicPath ?? product.MainPicPath ?? null;
  return (
    <Link href={`/product/${product.ProductId}`}>
      <article className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="relative h-48 w-full bg-gray-100">
          {isFeatured && (
            <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 px-2 py-0.5 text-[10px] font-bold text-white">
              <FiStar className="h-3 w-3" />
              Featured
            </span>
          )}
          <Image src={getImageUrl(pic)} alt={product.ProdcutTitle} fill className="object-cover" />
        </div>
        <div className="p-3">
          <p className="text-lg font-bold text-[#F97316]">{formatCurrency(product.Price, 'PKR')}</p>
          <h3 className="line-clamp-1 text-base font-semibold text-gray-900">{product.ProdcutTitle}</h3>
          <p className="mt-1 line-clamp-1 text-sm text-gray-500">{product.ProductDescription}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <FiMapPin className="h-3.5 w-3.5" />
              {product.Address}
            </span>
            <span className="inline-flex items-center gap-1">
              <FiClock className="h-3.5 w-3.5" />
              {product.TimeAgo}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

