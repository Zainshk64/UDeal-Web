import { Suspense } from 'react';
import ResetPasswordClient from './ResetPasswordClient';

export const dynamic = 'force-dynamic';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ResetPasswordClient />
    </Suspense>
  );
}
