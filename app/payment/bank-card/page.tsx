import { Suspense } from 'react';
import BankCardPaymentClient from '@/src/components/payment/BankCardPaymentClient';

export const dynamic = 'force-dynamic';

function BankCardFallback() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 py-28 flex items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </main>
  );
}

export default function BankCardPaymentPage() {
  return (
    <Suspense fallback={<BankCardFallback />}>
      <BankCardPaymentClient />
    </Suspense>
  );
}
