'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Container } from '@/src/components/ui/Container';
import Footer from '@/src/components/layout/Footer';
import { FiCheckCircle, FiXCircle, FiPackage, FiAlertCircle } from 'react-icons/fi';
import { cn } from '@/src/utils/cn';

export default function PaymentDoneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  // Get parameters
  const status = searchParams.get('status') || 'success';
  const method = searchParams.get('method') || 'bank';
  const orderId = searchParams.get('orderId');
  const amount = searchParams.get('amount');
  const rc = searchParams.get('rc');

  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending'>('success');

  useEffect(() => {
    if (rc === '00' || status === 'success') {
      setPaymentStatus('success');
    } else if (status === 'failed') {
      setPaymentStatus('failed');
    } else {
      setPaymentStatus('pending');
    }
  }, [rc, status]);

  const getMethodName = () => {
    switch (method) {
      case 'easypaisa': return 'EasyPaisa';
      case 'jazzcash': return 'JazzCash';
      case 'bank': return 'Bank Card';
      default: return 'Payment';
    }
  };

  const getStatusContent = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          icon: FiCheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100',
          borderColor: 'border-green-200',
          title: 'Payment Successful!',
          titleColor: 'text-green-700',
          message: 'Your payment has been processed successfully. Your package has been activated and is ready to use.',
          messageUrdu: 'آپ کی ادائیگی کامیابی سے مکمل ہو گئی ہے۔ آپ کا پیکیج فعال ہو گیا ہے اور استعمال کے لیے تیار ہے۔'
        };
      case 'failed':
        return {
          icon: FiXCircle,
          iconColor: 'text-red-600',
          bgColor: 'bg-red-100',
          borderColor: 'border-red-200',
          title: 'Payment Failed',
          titleColor: 'text-red-700',
          message: 'Your payment could not be processed. Please try again or contact our support team for assistance.',
          messageUrdu: 'آپ کی ادائیگی مکمل نہیں ہو سکی۔ براہ کرم دوبارہ کوشش کریں یا مدد کے لیے ہماری سپورٹ ٹیم سے رابطہ کریں۔'
        };
      case 'pending':
        return {
          icon: FiAlertCircle,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100',
          borderColor: 'border-yellow-200',
          title: 'Payment Pending',
          titleColor: 'text-yellow-700',
          message: 'Your payment is being verified. This usually takes 2-5 minutes. Please check your packages shortly.',
          messageUrdu: 'آپ کی ادائیگی کی تصدیق ہو رہی ہے۔ اس میں عام طور پر 2-5 منٹ لگتے ہیں۔ براہ کرم تھوڑی دیر بعد اپنے پیکجز چیک کریں۔'
        };
    }
  };

  const content = getStatusContent();
  const StatusIcon = content.icon;

  return (
    <>
      {/* <Navbar /> */}
      <main className="min-h-screen bg-gray-50 py-28">
        <Container className="max-w-2xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg">
            
            {/* Header with Status Icon */}
            <div className={cn('border-b p-8 text-center', content.bgColor, content.borderColor)}>
              <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-white shadow-md">
                <StatusIcon className={cn('h-12 w-12', content.iconColor)} />
              </div>
              <h1 className={cn('text-3xl font-bold', content.titleColor)}>
                {content.title}
              </h1>
            </div>

            {/* Payment Details */}
            <div className="p-6 sm:p-8">
              
              {/* Messages */}
              <div className="mb-6 space-y-4">
                {/* English Message */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-center leading-relaxed text-gray-700">
                    {content.message}
                  </p>
                </div>

                {/* Urdu Message */}
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4" dir="rtl">
                  <p className="text-center leading-relaxed text-gray-700">
                    {content.messageUrdu}
                  </p>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="mb-6 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="mb-4 text-lg font-bold text-gray-900">Transaction Details</h3>
                
                <div className="flex flex-col gap-3 sm:gap-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3">
                    <span className="text-sm text-gray-600 mb-1 sm:mb-0">Payment Method</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {getMethodName()}
                    </span>
                  </div>

                  {orderId && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3">
                      <span className="text-sm text-gray-600 mb-1 sm:mb-0">Order ID</span>
                      <span className="break-all font-mono text-sm font-semibold text-gray-900">
                        {orderId}
                      </span>
                    </div>
                  )}

                  {amount && (
                    <div className="flex flex-col sm:flex-row sm:justify-between border-b border-gray-200 pb-3">
                      <span className="text-sm text-gray-600 mb-1 sm:mb-0">Amount Paid</span>
                      <span className="text-xl font-bold text-primary">
                        Rs {parseInt(amount).toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row sm:justify-between pt-2">
                    <span className="text-sm text-gray-600 mb-1 sm:mb-0">Status</span>
                    <span className={cn(
                      'text-sm font-bold capitalize',
                      paymentStatus === 'success' && 'text-green-600',
                      paymentStatus === 'failed' && 'text-red-600',
                      paymentStatus === 'pending' && 'text-yellow-600'
                    )}>
                      {paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/my-ads/my-packages')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 text-lg font-bold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg active:scale-95"
                >
                  <FiPackage className="h-6 w-6" />
                  <span>View My Packages</span>
                </button>

                {/* Support Link for Failed Payments */}
                {paymentStatus === 'failed' && (
                  <button
                    onClick={() => router.push('/contact')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-primary bg-white py-4 text-lg font-bold text-primary transition-all hover:bg-primary/5 active:scale-95"
                  >
                    Contact Support
                  </button>
                )}

                {/* Retry for Failed */}
                {paymentStatus === 'failed' && (
                  <button
                    onClick={() => router.push('/my-ads/my-packages')}
                    className="w-full text-center text-sm text-gray-600 hover:text-primary transition"
                  >
                    Try Different Payment Method
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs sm:text-sm text-gray-600">
              🔒 Secured by SSL Encryption | Your payment information is 100% safe
            </p>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}