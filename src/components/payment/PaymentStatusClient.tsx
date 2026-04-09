'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FiCheckCircle,
  FiClock,
  FiXCircle,
  FiArrowLeft,
  FiPackage,
  FiRefreshCw,
} from 'react-icons/fi';
import { Container } from '@/src/components/ui/Container';
import { Navbar } from '@/src/components/layout/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { cn } from '@/src/utils/cn';

type PaymentStatus = 'pending' | 'success' | 'failed';

const methodLabels: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  'bank-card': 'Bank Card',
};

const methodColors: Record<string, string> = {
  jazzcash: 'from-red-500 to-red-600',
  easypaisa: 'from-green-500 to-green-600',
  'bank-card': 'from-[#003049] to-[#004d6d]',
};

export default function PaymentStatusClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const method = searchParams.get('method') || '';
  const status = (searchParams.get('status') || 'pending') as PaymentStatus;
  const orderId = searchParams.get('orderId') || '';

  const [countdown, setCountdown] = useState(60);
  const [checking, setChecking] = useState(false);

  const methodLabel = methodLabels[method] || 'Payment';
  const gradientClass = methodColors[method] || 'from-[#003049] to-[#004d6d]';

  useEffect(() => {
    if (status !== 'pending') return;
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, countdown]);

  const handleCheckStatus = () => {
    setChecking(true);
    setTimeout(() => {
      setChecking(false);
      router.push('/my-ads/my-packages');
    }, 1500);
  };

  const config = {
    pending: {
      icon: FiClock,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      title: 'Payment Pending',
      subtitle: 'Your payment request has been sent.',
      message:
        method === 'jazzcash'
          ? 'Please check your JazzCash app and approve the payment notification to complete the transaction.'
          : method === 'easypaisa'
          ? 'Please check your EasyPaisa app and approve the payment request to complete the transaction.'
          : 'Your payment is being processed. Please wait for confirmation.',
      badgeClass: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      badgeText: 'Pending Approval',
    },
    success: {
      icon: FiCheckCircle,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'Payment Successful!',
      subtitle: 'Your plan has been activated.',
      message: 'Thank you for your purchase. Your featured plan is now active and ready to use.',
      badgeClass: 'bg-green-100 text-green-700 border-green-200',
      badgeText: 'Payment Complete',
    },
    failed: {
      icon: FiXCircle,
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      title: 'Payment Failed',
      subtitle: 'We could not process your payment.',
      message: 'Your payment was not approved. Please try again or choose a different payment method.',
      badgeClass: 'bg-red-100 text-red-700 border-red-200',
      badgeText: 'Payment Failed',
    },
  };

  const current = config[status] ?? config.pending;
  const StatusIcon = current.icon;

  return (
    <>
      <Navbar variant="solid" showSearch={false} />

      <main className="min-h-screen bg-gray-50 pt-24 pb-12">
        {/* Top bar */}
        <div className={`bg-gradient-to-r ${gradientClass} py-8`}>
          <Container className="max-w-2xl">
            <button
              onClick={() => router.push('/my-ads/view-packages')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
            >
              <FiArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Packages</span>
            </button>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Payment Status</h1>
                <p className="text-white/70 text-sm mt-1">{methodLabel} Payment</p>
              </div>
              <span
                className={cn(
                  'px-4 py-1.5 rounded-full text-sm font-semibold border',
                  current.badgeClass
                )}
              >
                {current.badgeText}
              </span>
            </div>
          </Container>
        </div>

        <Container className="max-w-2xl py-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Status Icon */}
            <div className="p-10 text-center border-b border-gray-100">
              <motion.div
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                className={cn(
                  'w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6',
                  current.iconBg
                )}
              >
                <StatusIcon className={cn('w-12 h-12', current.iconColor)} />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">{current.title}</h2>
              <p className="text-gray-500 font-medium">{current.subtitle}</p>
            </div>

            {/* Message */}
            <div className="px-8 py-6 border-b border-gray-100">
              <p className="text-gray-600 text-center leading-relaxed">{current.message}</p>

              {status === 'pending' && (
                <div className="mt-5 bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                  <p className="text-yellow-700 text-sm font-medium">
                    Please do not close this page. Check your {methodLabel} app and approve the request.
                  </p>
                  {countdown > 0 && (
                    <p className="text-yellow-600 text-xs mt-2">
                      Auto-redirecting to packages in{' '}
                      <span className="font-bold">{countdown}s</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Order Details */}
            {orderId && (
              <div className="px-8 py-5 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Order ID</span>
                  <span className="font-mono text-sm font-semibold text-gray-900">{orderId}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-900">{methodLabel}</span>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="px-8 py-6 space-y-3">
              {status === 'pending' && (
                <button
                  onClick={handleCheckStatus}
                  disabled={checking}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#003049] to-[#004d6d] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95 disabled:opacity-70"
                >
                  {checking ? (
                    <>
                      <FiRefreshCw className="w-5 h-5 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <FiPackage className="w-5 h-5" />
                      Check My Packages
                    </>
                  )}
                </button>
              )}

              {status === 'success' && (
                <button
                  onClick={() => router.push('/my-ads/my-packages')}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  <FiPackage className="w-5 h-5" />
                  View My Packages
                </button>
              )}

              {status === 'failed' && (
                <>
                  <button
                    onClick={() => router.push('/my-ads/view-packages')}
                    className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-[#F97316] to-[#ea580c] text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={() => router.push('/my-ads')}
                    className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    <FiArrowLeft className="w-4 h-4" />
                    Back to My Ads
                  </button>
                </>
              )}

              {status === 'pending' && (
                <button
                  onClick={() => router.push('/my-ads')}
                  className="w-full flex items-center justify-center gap-2 py-3 border-2 border-gray-200 text-gray-600 rounded-2xl font-semibold hover:bg-gray-50 transition-all"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to My Ads
                </button>
              )}
            </div>
          </motion.div>

          <p className="text-center text-xs text-gray-400 mt-6">
            🔒 Your payment is secured with SSL encryption
          </p>
        </Container>
      </main>

      <Footer />
    </>
  );
}
