import { Suspense } from 'react';
import CategoryPageClient from '@/src/components/category/CategoryPageClient';

export const dynamic = 'force-dynamic';

export default function CategoryPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CategoryPageClient />
    </Suspense>
  );
}
