import type { Metadata } from 'next';
import FavoritesClient from '@/src/components/favorites/FavoritesClient';

export const metadata: Metadata = {
  title: 'Favorites | UDealZone',
  description: 'Your saved listings on UDealZone.',
};

export const dynamic = 'force-dynamic';

export default function FavoritesPage() {
  return <FavoritesClient />;
}
