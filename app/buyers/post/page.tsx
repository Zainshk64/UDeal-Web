import type { Metadata } from 'next';
import { Suspense } from 'react';
import BuyerPostClient from '@/src/components/buyers/BuyerPostClient';

export const metadata: Metadata = {
  title: 'Post buyer request | UDealZone',
  description: 'Post what you want to buy on UDealZone.',
};

export default function BuyerPostPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        </div>
      }
    >
      <BuyerPostClient />
    </Suspense>
  );
}
