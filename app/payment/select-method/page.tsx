import { Suspense } from 'react';
import SelectPaymentMethodClient from '@/src/components/payment/SelectPaymentMethodClient';

export const dynamic = 'force-dynamic';

function SelectMethodFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-28 flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </main>
  );
}

export default function SelectPaymentMethodPage() {
  return (
    <Suspense fallback={<SelectMethodFallback />}>
      <SelectPaymentMethodClient />
    </Suspense>
  );
}
