import { Suspense } from 'react';
import ViewPackagesClient from './ViewPackagesClient';

export const dynamic = 'force-dynamic';

export default function ViewPackagesPage() {
  return (
    <Suspense
      fallback={
        <main className="py-28 min-h-screen bg-gray-100 flex items-center justify-center">
          <p className="text-gray-500">Loading packages...</p>
        </main>
      }
    >
      <ViewPackagesClient />
    </Suspense>
  );
}
