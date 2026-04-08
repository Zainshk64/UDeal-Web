// src/app/payment/bank-card/page.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import {
  generateAlfalahAuthToken,
  getAlfalahSsoHtml,
  callAlfalahIpnListener,
  activateBankSubscription,
} from '@/src/api/services/paymentApi';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';
import {
  FiArrowLeft,
  FiCreditCard,
  FiShield,
  FiLock,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';

type PaymentState =
  | 'idle'
  | 'generating_token'
  | 'loading_sso'
  | 'webview'
  | 'calling_ipn'
  | 'activating_plan'
  | 'success'
  | 'failed';

// ✅ URL Detection for Bank Redirects
const isBankSuccess = (url: string) => {
  const lower = url.toLowerCase();
  return (
    lower.includes('successpayment') ||
    (lower.includes('paymentdone.aspx') && lower.includes('rc=00'))
  );
};

const isBankFailure = (url: string) => {
  const lower = url.toLowerCase();
  return (
    lower.includes('declinepayment') ||
    (lower.includes('paymentdone.aspx') && !lower.includes('rc=00'))
  );
};

export default function BankCardPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const planId = searchParams.get('planId');
  const price = searchParams.get('price');

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isHandledRef = useRef(false);
  const messageListenerRef = useRef<((event: MessageEvent) => void) | null>(null);

  const [paymentState, setPaymentState] = useState<PaymentState>('idle');
  const [ssoHtml, setSsoHtml] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState('');
  const [resultInfo, setResultInfo] = useState<{
    status: string;
    message: string;
    orderId?: string;
    amount?: number;
    subscriptionId?: number;
  } | null>(null);

  const planPrice = price ? Number(price) : 0;

  // ══════════════════════════════════════════════
  // CLEANUP: Remove message listener on unmount
  // ══════════════════════════════════════════════
  useEffect(() => {
    return () => {
      if (messageListenerRef.current) {
        window.removeEventListener('message', messageListenerRef.current);
      }
    };
  }, []);

  // ══════════════════════════════════════════════
  // STEP 1 + 2: Generate Token → Load SSO HTML
  // ══════════════════════════════════════════════
  const startPayment = async () => {
    if (!planId || !planPrice) {
      toast.error('Plan details missing');
      return;
    }

    try {
      isHandledRef.current = false;
      setPaymentState('generating_token');
      setResultInfo(null);
      setStatusMessage('Creating secure payment session...');

      console.log('🏦 Step 1: Generating auth token for amount:', planPrice);
      const tokenRes = await generateAlfalahAuthToken(planPrice);
      setOrderId(tokenRes.orderId);
      console.log('✅ Got orderId:', tokenRes.orderId);

      setPaymentState('loading_sso');
      setStatusMessage('Loading secure checkout...');

      console.log('🏦 Step 2: Getting SSO HTML');
      const html = await getAlfalahSsoHtml(tokenRes.orderId, tokenRes.authToken);

      setSsoHtml(html);
      setPaymentState('webview');
      setIframeLoading(true);
      console.log('✅ SSO HTML loaded, opening payment gateway...');

      // Setup iframe message listener
      setupIframeListener(tokenRes.orderId);
    } catch (error: any) {
      console.error('❌ Payment start failed:', error?.message);
      setPaymentState('failed');
      setResultInfo({
        status: 'Failed',
        message: error?.message || 'Could not start payment. Please try again.',
      });
      toast.error(error?.message || 'Failed to start payment');
    }
  };

  // ══════════════════════════════════════════════
  // STEP 3: Listen to iframe navigation/messages
  // ══════════════════════════════════════════════
  const setupIframeListener = (currentOrderId: string) => {
    // Remove previous listener if exists
    if (messageListenerRef.current) {
      window.removeEventListener('message', messageListenerRef.current);
    }

    const handleMessage = (event: MessageEvent) => {
      // Security check - only accept messages from trusted domains
      const trustedDomains = [
        'https://sandbox.bankalfalah.com',
        'https://payments.bankalfalah.com',
      ];

      if (!trustedDomains.some((domain) => event.origin.includes(domain))) {
        return;
      }

      console.log('📨 Received message from iframe:', event.data);

      // Check for payment completion signals
      if (typeof event.data === 'string') {
        const lower = event.data.toLowerCase();

        if (isBankSuccess(lower)) {
          console.log('✅ Bank SUCCESS detected from message');
          handleBankPaymentCompleted(currentOrderId);
        } else if (isBankFailure(lower)) {
          console.log('❌ Bank FAILURE detected from message');
          handleBankPaymentFailed();
        }
      }
    };

    messageListenerRef.current = handleMessage;
    window.addEventListener('message', handleMessage);
  };

  // Monitor iframe URL changes via interval (fallback method)
  useEffect(() => {
    if (paymentState !== 'webview' || !iframeRef.current || !orderId) return;

    const checkInterval = setInterval(() => {
      try {
        const iframe = iframeRef.current;
        if (!iframe || !iframe.contentWindow) return;

        // Try to get iframe URL (may fail due to CORS)
        try {
          const iframeUrl = iframe.contentWindow.location.href;
          console.log('🔍 Checking iframe URL:', iframeUrl);

          if (isBankSuccess(iframeUrl)) {
            console.log('✅ Success URL detected');
            clearInterval(checkInterval);
            handleBankPaymentCompleted(orderId);
          } else if (isBankFailure(iframeUrl)) {
            console.log('❌ Failure URL detected');
            clearInterval(checkInterval);
            handleBankPaymentFailed();
          }
        } catch (e) {
          // CORS blocked - this is normal, ignore
        }
      } catch (error) {
        console.log('URL check error:', error);
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [paymentState, orderId]);

  // ══════════════════════════════════════════════
  // STEP 4 + 5: IPN → Subscription (Sequential)
  // ══════════════════════════════════════════════
  const handleBankPaymentCompleted = async (currentOrderId?: string) => {
    const orderIdToUse = currentOrderId || orderId;

    if (!orderIdToUse) {
      console.error('❌ No orderId available');
      setPaymentState('failed');
      setResultInfo({ status: 'Failed', message: 'Order ID missing' });
      return;
    }

    if (isHandledRef.current) {
      console.log('⚠️ Already handling payment completion');
      return;
    }

    isHandledRef.current = true;
    setSsoHtml(null);

    try {
      // ── STEP 4: Call IPN Listener ──
      setPaymentState('calling_ipn');
      setStatusMessage('Verifying payment with bank...');
      console.log('📞 Step 4: Calling IPN for order:', orderIdToUse);

      const ipnResult = await callAlfalahIpnListener(orderIdToUse, 3, 5000);

      if (!ipnResult.responseCode) {
        console.error('❌ IPN failed:', ipnResult.responseText);
        setPaymentState('failed');
        setResultInfo({
          status: 'Failed',
          message:
            'Could not verify payment with bank. Please contact support if amount was deducted.',
          orderId: orderIdToUse,
          amount: planPrice,
        });
        toast.error('Payment verification failed');
        return;
      }

      console.log('✅ IPN confirmed — payment status updated');

      // ── STEP 5: Activate Subscription ──
      setPaymentState('activating_plan');
      setStatusMessage('Activating your plan...');
      console.log('📞 Step 5: Activating subscription...');

      const subResult = await activateBankSubscription(orderIdToUse, Number(planId));

      if (subResult.returnCode) {
        console.log('🎉 Subscription activated! ID:', subResult.subscriptionId);
        setPaymentState('success');
        setResultInfo({
          status: 'Paid',
          message: subResult.returnText || 'Payment completed & plan activated!',
          orderId: subResult.orderId || orderIdToUse,
          amount: planPrice,
          subscriptionId: subResult.subscriptionId,
        });
        toast.success('Payment Successful! 🎉');
      } else {
        console.error('❌ Subscription failed:', subResult.returnText);
        setPaymentState('failed');
        setResultInfo({
          status: 'Declined',
          message: subResult.returnText || 'Payment was declined by the bank',
          orderId: orderIdToUse,
          amount: planPrice,
        });
        toast.error('Payment declined by bank');
      }
    } catch (error: any) {
      console.error('❌ Post-payment error:', error?.message);
      setPaymentState('failed');
      setResultInfo({
        status: 'Failed',
        message: error?.message || 'Verification failed',
        orderId: orderIdToUse,
        amount: planPrice,
      });
      toast.error('Payment processing failed');
    }
  };

  const handleBankPaymentFailed = () => {
    if (isHandledRef.current) return;

    isHandledRef.current = true;
    setSsoHtml(null);
    setPaymentState('failed');
    setResultInfo({
      status: 'Declined',
      message: 'Payment was declined or cancelled by the bank',
      orderId: orderId || undefined,
    });
    toast.error('Payment declined');
  };

  const handleCancel = () => {
    if (paymentState === 'calling_ipn' || paymentState === 'activating_plan') {
      toast.info('Please wait, payment is being processed...');
      return;
    }

    isHandledRef.current = true;
    setSsoHtml(null);
    setOrderId(null);
    setResultInfo(null);
    setPaymentState('idle');
    router.back();
  };

  const handleDone = () => {
    if (paymentState === 'success') {
      router.push('/my-ads');
    } else {
      router.back();
    }
  };

  const handleRetry = () => {
    isHandledRef.current = false;
    setSsoHtml(null);
    setOrderId(null);
    setResultInfo(null);
    setPaymentState('idle');
  };

  const isLoading = paymentState === 'generating_token' || paymentState === 'loading_sso';
  const isProcessing = paymentState === 'calling_ipn' || paymentState === 'activating_plan';

  // ═══════════════════════════════════════
  // RENDER: WebView (iframe)
  // ═══════════════════════════════════════
  if (paymentState === 'webview' && ssoHtml) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-primary to-primary-dark px-4 py-4 shadow-lg">
          <button
            onClick={handleCancel}
            className="rounded-full p-2 text-white transition hover:bg-white/10"
          >
            <FiX className="h-6 w-6" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-bold text-white">Secure Payment</h2>
            <div className="mt-1 flex items-center justify-center gap-1 text-xs text-green-300">
              <FiLock className="h-3 w-3" />
              <span>256-bit SSL Encrypted</span>
            </div>
          </div>
          <div className="w-10" />
        </div>

        {/* Loading Indicator */}
        {iframeLoading && (
          <div className="absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-white px-6 py-4 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
                <span className="text-gray-700">Loading checkout...</span>
              </div>
            </div>
          </div>
        )}

        {/* Bank iframe */}
        <iframe
          ref={iframeRef}
          srcDoc={ssoHtml}
          className="h-full w-full flex-1"
          onLoad={() => {
            setIframeLoading(false);
            console.log('✅ iframe loaded');
          }}
          sandbox="allow-forms allow-scripts allow-same-origin allow-top-navigation allow-popups"
          title="Bank Alfalah Secure Payment"
        />

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-xs text-gray-600">
          <div className="flex items-center justify-center gap-2">
            <FiShield className="h-4 w-4 text-green-600" />
            <span>
              Secured by Bank Alfalah | PCI DSS Compliant | 3D Secure
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Processing (IPN / Subscription)
  // ═══════════════════════════════════════
  if (isProcessing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <Container className="max-w-md">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="h-24 w-24 animate-spin rounded-full border-8 border-gray-200 border-t-accent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <FiCreditCard className="h-10 w-10 text-accent" />
                </div>
              </div>
            </div>

            <h2 className="mb-2 text-center text-2xl font-bold text-gray-900">
              {paymentState === 'calling_ipn'
                ? 'Verifying Payment...'
                : 'Activating Your Plan...'}
            </h2>
            <p className="mb-6 text-center text-gray-600">
              {statusMessage || 'Please do not close this window.'}
            </p>

            {/* Progress Steps */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                  <FiCheckCircle className="h-5 w-5 text-white" />
                </div>
                <span className="text-sm text-gray-700">Payment submitted to bank</span>
              </div>

              <div className="flex items-center gap-3">
                {paymentState === 'calling_ipn' ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500">
                    <FiCheckCircle className="h-5 w-5 text-white" />
                  </div>
                )}
                <span className="text-sm text-gray-700">Confirming with bank</span>
              </div>

              <div className="flex items-center gap-3">
                {paymentState === 'activating_plan' ? (
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-accent" />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300">
                    <div className="h-2 w-2 rounded-full bg-gray-300" />
                  </div>
                )}
                <span className="text-sm text-gray-700">Activating subscription</span>
              </div>
            </div>

            {orderId && (
              <div className="mt-6 rounded-2xl bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs text-gray-500">Order ID</p>
                <p className="mt-1 font-mono text-sm font-semibold text-gray-900">{orderId}</p>
              </div>
            )}
          </div>
        </Container>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Result (Success / Failed)
  // ═══════════════════════════════════════
  if (paymentState === 'success' || paymentState === 'failed') {
    const isSuccess = paymentState === 'success';

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <Container className="max-w-lg">
          <div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-2xl">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div
                className={cn(
                  'flex h-24 w-24 items-center justify-center rounded-full',
                  isSuccess ? 'bg-green-100' : 'bg-red-100'
                )}
              >
                {isSuccess ? (
                  <FiCheckCircle className="h-12 w-12 text-green-600" />
                ) : (
                  <FiXCircle className="h-12 w-12 text-red-600" />
                )}
              </div>
            </div>

            {/* Title */}
            <h2
              className={cn(
                'mb-2 text-center text-3xl font-bold',
                isSuccess ? 'text-green-700' : 'text-red-700'
              )}
            >
              {isSuccess ? 'Payment Successful!' : 'Payment Failed'}
            </h2>

            {/* Message */}
            <p className="mb-6 text-center text-gray-600 leading-relaxed">
              {resultInfo?.message || ''}
            </p>

            {/* Details */}
            {(resultInfo?.orderId || resultInfo?.amount) && (
              <div className="mb-6 space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                {resultInfo?.orderId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Order ID</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {resultInfo.orderId}
                    </span>
                  </div>
                )}
                {resultInfo?.amount && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Amount</span>
                    <span className="text-lg font-bold text-primary">
                      Rs {resultInfo.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {resultInfo?.subscriptionId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Subscription ID</span>
                    <span className="text-sm font-semibold text-green-600">
                      #{resultInfo.subscriptionId}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={handleDone}
                className={cn(
                  'flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95',
                  isSuccess
                    ? 'bg-gradient-to-r from-green-500 to-green-600'
                    : 'bg-gradient-to-r from-primary to-primary-dark'
                )}
              >
                {isSuccess ? 'View My Packages' : 'Go Back'}
              </button>

              {!isSuccess && (
                <button
                  onClick={handleRetry}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-accent to-accent-dark py-4 text-lg font-bold text-white shadow-lg transition-all hover:shadow-xl active:scale-95"
                >
                  Try Again
                </button>
              )}
            </div>
          </div>
        </Container>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // RENDER: Idle Screen (Initial)
  // ═══════════════════════════════════════
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-accent/5 py-28">
      <Container className="max-w-3xl">
        <button
          onClick={() => router.back()}
          disabled={isLoading}
          className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-primary disabled:opacity-50"
        >
          <FiArrowLeft className="h-5 w-5" />
          <span className="font-medium">Change Payment Method</span>
        </button>

        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-primary to-primary-dark p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-white/20 p-4 backdrop-blur-sm">
                <FiCreditCard className="h-10 w-10" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Bank Card Payment</h1>
                <p className="mt-1 text-primary-light/80">
                  Secure payment with Visa or Mastercard
                </p>
              </div>
            </div>

            {planPrice > 0 && (
              <div className="mt-6 rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                <p className="text-sm text-primary-light/80">Amount to Pay</p>
                <p className="mt-2 text-4xl font-bold">Rs {planPrice.toLocaleString()}</p>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Card Visual */}
            <div className="mb-8 flex justify-center">
              <div
                className="relative h-52 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
                style={{
                  background: 'linear-gradient(135deg, #003049 0%, #004d6d 100%)',
                }}
              >
                {/* Chip */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="h-10 w-12 rounded bg-gradient-to-br from-yellow-300 to-yellow-500" />
                  <span className="text-xs text-white/60">CREDIT / DEBIT</span>
                </div>

                {/* Card Number Dots */}
                <div className="mb-6 flex justify-between px-2">
                  {[1, 2, 3, 4].map((group) => (
                    <div key={group} className="flex gap-1">
                      {[1, 2, 3, 4].map((dot) => (
                        <div key={dot} className="h-2 w-2 rounded-full bg-white/40" />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Card Holder & Logo */}
                <div className="flex items-end justify-between">
                  <span className="text-sm text-white/80">CARD HOLDER</span>
                  <div className="flex">
                    <div className="h-8 w-8 rounded-full bg-red-500 opacity-80" />
                    <div className="-ml-3 h-8 w-8 rounded-full bg-yellow-500 opacity-80" />
                  </div>
                </div>
              </div>
            </div>

            {/* Info Section */}
            <div className="mb-8 rounded-2xl border-2 border-primary/20 bg-primary/5 p-6">
              <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <FiAlertCircle className="h-5 w-5 text-accent" />
                What happens next?
              </h3>
              <ol className="space-y-3">
                <li className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    1
                  </div>
                  <p className="text-gray-700">
                    You'll be redirected to Bank Alfalah's secure payment gateway
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    2
                  </div>
                  <p className="text-gray-700">
                    Enter your card details (Visa/Mastercard/UnionPay accepted)
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    3
                  </div>
                  <p className="text-gray-700">
                    Complete 3D Secure verification (OTP from your bank)
                  </p>
                </li>
                <li className="flex gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                    4
                  </div>
                  <p className="text-gray-700">
                    Your package will be activated automatically upon successful payment
                  </p>
                </li>
              </ol>
            </div>

            {/* Security Badges */}
            <div className="mb-8 grid grid-cols-3 gap-4">
              {[
                { icon: FiLock, label: 'SSL Secure', color: 'text-blue-600' },
                { icon: FiShield, label: 'PCI DSS', color: 'text-green-600' },
                { icon: FiCreditCard, label: '3D Secure', color: 'text-purple-600' },
              ].map((badge, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                    <badge.icon className={cn('h-7 w-7', badge.color)} />
                  </div>
                  <p className="text-xs font-semibold text-gray-600">{badge.label}</p>
                </div>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                  <div>
                    <p className="font-semibold text-blue-900">
                      {paymentState === 'generating_token'
                        ? 'Creating secure payment session...'
                        : 'Loading checkout page...'}
                    </p>
                    <p className="text-sm text-blue-700">Please wait...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Pay Button */}
            <button
              onClick={startPayment}
              disabled={isLoading}
              className={cn(
                'flex w-full items-center justify-center gap-3 rounded-2xl py-5 text-lg font-bold text-white shadow-xl transition-all',
                isLoading
                  ? 'cursor-not-allowed bg-gray-300'
                  : 'bg-gradient-to-r from-accent to-accent-dark hover:shadow-2xl active:scale-95'
              )}
            >
              {isLoading ? (
                <>
                  <div className="h-6 w-6 animate-spin rounded-full border-3 border-white border-t-transparent" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FiCreditCard className="h-6 w-6" />
                  <span>Proceed to Payment</span>
                </>
              )}
            </button>

            {/* Disclaimer */}
            <p className="mt-6 text-center text-xs leading-relaxed text-gray-500">
              By proceeding, you agree to the payment terms.
              <br />
              Card details are handled securely by Bank Alfalah.
              <br />
              UDealZone never stores your card information.
            </p>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            🔒 Protected by 256-bit SSL encryption | PCI DSS Level 1 Certified
          </p>
        </div>
      </Container>
    </main>
  );
}