'use client';

import React, { Suspense } from 'react';
import PaymentDoneContent from './PaymentDoneContent';

export default function PaymentDonePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    }>
      <PaymentDoneContent />
    </Suspense>
  );
}