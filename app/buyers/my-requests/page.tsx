import type { Metadata } from 'next';
import MyBuyerRequestsClient from '@/src/components/buyers/MyBuyerRequestsClient';

export const metadata: Metadata = {
  title: 'My buyer requests | UDealZone',
  description: 'Manage your buyer requests on UDealZone.',
};

export default function MyBuyerRequestsPage() {
  return <MyBuyerRequestsClient />;
}
