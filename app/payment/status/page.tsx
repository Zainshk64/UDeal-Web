import { Suspense } from 'react';
import PaymentStatusClient from '@/src/components/payment/PaymentStatusClient';

export const dynamic = 'force-dynamic';

function StatusFallback() {
  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#003049] border-t-transparent" />
    </main>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense fallback={<StatusFallback />}>
      <PaymentStatusClient />
    </Suspense>
  );
}
