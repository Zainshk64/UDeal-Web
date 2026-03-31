import { Suspense } from 'react';
import SellerAdsClient from './SellerAdsClient';

export default function SellerAdsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <SellerAdsClient />
    </Suspense>
  );
}
