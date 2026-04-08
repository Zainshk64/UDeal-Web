import { Suspense } from 'react';
import MyPackagesClient from './MyPackagesClient';

export const dynamic = 'force-dynamic';

export default function MyPackagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <MyPackagesClient />
    </Suspense>
  );
}
