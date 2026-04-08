import { Suspense } from 'react';
import ProfilePageClient from './ProfilePageClient';

export const dynamic = 'force-dynamic';

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
