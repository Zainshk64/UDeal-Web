import { Suspense } from 'react';
import JazzCashPaymentClient from '@/src/components/payment/JazzCashPaymentClient';

export const dynamic = 'force-dynamic';

function PaymentFallback() {
  return (
    <main className="min-h-screen py-28 flex items-center justify-center bg-gray-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent" />
    </main>
  );
}

export default function JazzCashPaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <JazzCashPaymentClient />
    </Suspense>
  );
}
