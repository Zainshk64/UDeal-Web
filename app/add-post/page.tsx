import { Suspense } from 'react';
import AddPostPage from './AddPostClient';

export const dynamic = 'force-dynamic';

export default function AddPostRoutePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <AddPostPage />
    </Suspense>
  );
}
