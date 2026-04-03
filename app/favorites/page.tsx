import type { Metadata } from 'next';
import FavoritesClient from '@/src/components/favorites/FavoritesClient';

export const metadata: Metadata = {
  title: 'Favorites | UDealZone',
  description: 'Your saved listings on UDealZone.',
};

export default function FavoritesPage() {
  return <FavoritesClient />;
}
