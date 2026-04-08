import { Suspense } from 'react';
import VerifyOtpClient from './VerfiyOtpClient';

export const dynamic = 'force-dynamic';

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <VerifyOtpClient />
    </Suspense>
  );
}
