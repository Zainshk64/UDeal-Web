import { Suspense } from 'react';
import { ProductDetailSkeleton } from '@/src/components/product/ProductDetailSkeleton';
import ProductDetailPageClient from '@/src/components/product/ProductDetailPageClient';

export const dynamic = 'force-dynamic';

export default function ProductDetailPage() {
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailPageClient />
    </Suspense>
  );
}
