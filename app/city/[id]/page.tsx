import { Suspense } from 'react';
import CityPageClient from './CityPageClient';

export default function CityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <CityPageClient />
    </Suspense>
  );
}
