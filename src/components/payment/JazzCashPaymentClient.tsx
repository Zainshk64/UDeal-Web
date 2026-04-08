// src/app/payment/jazzcash/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import { initiateJazzCash } from '@/src/api/services/paymentApi';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';
import {
  FiArrowLeft,
  FiSmartphone,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
  FiCreditCard,
} from 'react-icons/fi';

export default function JazzCashPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planId = searchParams.get('planId');
  const price = searchParams.get('price');

  const [mobileNumber, setMobileNumber] = useState('');
  const [cnic, setCnic] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.userId || !planId) {
      toast.error('Missing required information');
      return;
    }

    // Validate mobile number
    if (!/^03\d{9}$/.test(mobileNumber)) {
      toast.error('Please enter a valid 11-digit mobile number starting with 03');
      return;
    }

    // Validate CNIC (last 6 digits)
    if (!/^\d{6}$/.test(cnic)) {
      toast.error('Please enter the last 6 digits of your CNIC');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await initiateJazzCash(
        mobileNumber,
        cnic,
        parseInt(planId),
        user.userId
      );

      if (result.isError) {
        toast.error(result.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        toast.success(result.message || 'Payment request sent successfully');
        router.push(`/payment/status?method=jazzcash&status=pending&orderId=${result.data?.orderId || ''}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 py-28">
      <Container className="max-w-2xl">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-primary"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span className="font-medium">Change Payment Method</span>
        </button>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <FiSmartphone className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">JazzCash Payment</h1>
                <p className="mt-1 text-red-100">Quick & reliable mobile payment</p>
              </div>
            </div>
            {price && (
              <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-red-100">Amount to Pay</p>
                <p className="mt-1 text-3xl font-bold">Rs {parseInt(price).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  JazzCash Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiSmartphone className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your 11-digit JazzCash mobile account number
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  Last 6 Digits of CNIC
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={cnic}
                    onChange={(e) => setCnic(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="XXXXXX"
                    maxLength={6}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none transition focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiCreditCard className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Example: If your CNIC is 12345-1234567-1, enter 234567
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border-2 border-red-100 bg-red-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-red-500 p-2">
                    <FiAlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Important Instructions</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong>English:</strong> You will receive an SMS or notification on your JazzCash app for payment confirmation. Please approve it.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong>Urdu:</strong> آپ کو اپنی JazzCash ایپ پر SMS یا نوٹیفکیشن موصول ہوگی۔ ادائیگی کی تصدیق کے لیے براہ کرم منظور کریں۔
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      The CNIC is required for non-EDC (Electronic Data Capture) transactions for security purposes
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-red-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      Ensure sufficient balance in your JazzCash account before proceeding
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !mobileNumber || mobileNumber.length !== 11 || !cnic || cnic.length !== 6}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all',
                  isProcessing || !mobileNumber || mobileNumber.length !== 11 || !cnic || cnic.length !== 6
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-xl active:scale-95'
                )}
              >
                {isProcessing ? (
                  <>
                    <FiLoader className="h-6 w-6 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="h-6 w-6" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Security Badge */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Secured by SSL Encryption | Your payment is 100% safe
          </p>
        </div>
      </Container>
    </main>
  );
}