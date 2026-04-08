import { Suspense } from 'react';
import EasyPaisaPaymentClient from '@/src/components/payment/EasyPaisaPaymentClient';

export const dynamic = 'force-dynamic';

function PaymentFallback() {
  return (
    <main className="min-h-screen py-28 flex items-center justify-center bg-gray-50">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-green-600 border-t-transparent" />
    </main>
  );
}

export default function EasyPaisaPaymentPage() {
  return (
    <Suspense fallback={<PaymentFallback />}>
      <EasyPaisaPaymentClient />
    </Suspense>
  );
}
