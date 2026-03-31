import { Suspense } from 'react';
import MyAdsClient from './MyAdsClient';

export default function MyAdsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <MyAdsClient />
    </Suspense>
  );
}
