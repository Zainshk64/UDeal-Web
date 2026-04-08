import { Suspense } from 'react';
import ProductSearchPageClient from '@/src/components/search/ProductSearchPageClient';

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#F97316] border-t-transparent" />
        </div>
      }
    >
      <ProductSearchPageClient />
    </Suspense>
  );
}
