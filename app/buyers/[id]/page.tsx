import type { Metadata } from 'next';
import BuyerDetailClient from '@/src/components/buyers/BuyerDetailClient';

export const metadata: Metadata = {
  title: 'Buyer request | UDealZone',
  description: 'Buyer request details on UDealZone.',
};

export const dynamic = 'force-dynamic';

export default function BuyerDetailPage() {
  return <BuyerDetailClient />;
}
