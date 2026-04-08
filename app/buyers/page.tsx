import type { Metadata } from 'next';
import BuyersListClient from '@/src/components/buyers/BuyersListClient';

export const metadata: Metadata = {
  title: 'Buyer requests | UDealZone',
  description: 'See what buyers are looking for on UDealZone.',
};

export const dynamic = 'force-dynamic';

export default function BuyersPage() {
  return <BuyersListClient />;
}
