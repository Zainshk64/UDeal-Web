// src/app/payment/easypaisa/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import { initiateEasyPaisa } from '@/src/api/services/paymentApi';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';
import {
  FiArrowLeft,
  FiSmartphone,
  FiAlertCircle,
  FiCheckCircle,
  FiLoader,
} from 'react-icons/fi';

export default function EasyPaisaPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planId = searchParams.get('planId');
  const price = searchParams.get('price');

  const [mobileNumber, setMobileNumber] = useState('');
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

    setIsProcessing(true);

    try {
      const result = await initiateEasyPaisa(
        mobileNumber,
        parseInt(planId),
        user.userId
      );

      if (result.isError) {
        toast.error(result.message || 'Payment failed');
        setIsProcessing(false);
      } else {
        toast.success(result.message || 'Payment request sent successfully');
        router.push(`/payment/status?method=easypaisa&status=pending&orderId=${result.data?.orderId || ''}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-50 py-28">
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
          <div className="bg-gradient-to-br from-green-500 to-green-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <FiSmartphone className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">EasyPaisa Payment</h1>
                <p className="mt-1 text-green-100">Fast & secure mobile payment</p>
              </div>
            </div>
            {price && (
              <div className="mt-6 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <p className="text-sm text-green-100">Amount to Pay</p>
                <p className="mt-1 text-3xl font-bold">Rs {parseInt(price).toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-semibold text-gray-900">
                  EasyPaisa Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 11))}
                    placeholder="03XXXXXXXXX"
                    maxLength={11}
                    className="w-full rounded-2xl border-2 border-gray-200 px-4 py-4 text-lg outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-500/10"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <FiSmartphone className="h-6 w-6 text-gray-400" />
                  </div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  Enter your 11-digit EasyPaisa mobile account number
                </p>
              </div>

              {/* Instructions */}
              <div className="rounded-2xl border-2 border-green-100 bg-green-50 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-full bg-green-500 p-2">
                    <FiAlertCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="font-bold text-gray-900">Important Instructions</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong>English:</strong> You will receive a payment request on your EasyPaisa app. Please approve it to complete the payment.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      <strong>Urdu:</strong> آپ کو اپنی EasyPaisa ایپ پر ادائیگی کی درخواست موصول ہوگی۔ ادائیگی مکمل کرنے کے لیے براہ کرم اسے منظور کریں۔
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      Make sure you have sufficient balance in your EasyPaisa account
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-green-500" />
                    <p className="text-sm leading-relaxed text-gray-700">
                      Payment will be processed within 2-5 minutes after approval
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing || !mobileNumber || mobileNumber.length !== 11}
                className={cn(
                  'flex w-full items-center justify-center gap-3 rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all',
                  isProcessing || !mobileNumber || mobileNumber.length !== 11
                    ? 'cursor-not-allowed bg-gray-300'
                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:shadow-xl active:scale-95'
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