// src/app/payment/select-method/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/src/components/ui/Container';
import { useAuth } from '@/src/context/AuthContext';
import { getAllPackages, BundlePlan } from '@/src/api/services/PackagesApi';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';
import {
  FiArrowLeft,
  FiCreditCard,
  FiSmartphone,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';

export default function SelectPaymentMethodPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const planId = searchParams.get('planId');

  const [selectedPlan, setSelectedPlan] = useState<BundlePlan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to continue');
      router.push('/auth/login');
      return;
    }

    if (!planId) {
      toast.error('No plan selected');
      router.push('/view-packages');
      return;
    }

    const fetchPlan = async () => {
      const plans = await getAllPackages();
      const plan = plans.find((p) => p.adPlanId.toString() === planId);
      if (plan) {
        setSelectedPlan(plan);
      } else {
        toast.error('Plan not found');
        router.push('/view-packages');
      }
      setLoading(false);
    };

    fetchPlan();
  }, [planId, isAuthenticated, router]);

  const paymentMethods = [
    {
      id: 'easypaisa',
      name: 'EasyPaisa',
      icon: FiSmartphone,
      description: 'Pay using your EasyPaisa mobile account',
      color: 'bg-gradient-to-br from-green-500 to-green-600',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      id: 'jazzcash',
      name: 'JazzCash',
      icon: FiSmartphone,
      description: 'Pay using your JazzCash mobile account',
      color: 'bg-gradient-to-br from-red-500 to-red-600',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
    },
    {
      id: 'bank-card',
      name: 'Debit/Credit Card',
      icon: FiCreditCard,
      description: 'Pay securely with Visa or Mastercard',
      color: 'bg-gradient-to-br from-primary to-primary-dark',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
      badge: 'Most Secure',
    },
  ];

  const handleSelectMethod = (methodId: string) => {
    router.push(`/payment/${methodId}?planId=${planId}&price=${selectedPlan?.price}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-28">
        <Container>
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 py-28">
      <Container className="max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 transition hover:text-primary"
          >
            <FiArrowLeft className="h-5 w-5" />
            <span className="font-medium">Back to Packages</span>
          </button>

          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-8 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Select Payment Method</h1>
                <p className="mt-2 text-gray-600">
                  Choose how you'd like to pay for your package
                </p>
              </div>
              <div className="rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 p-4">
                <FiShield className="h-8 w-8 text-accent" />
              </div>
            </div>

            {/* Package Summary */}
            {selectedPlan && (
              <div className="mt-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Selected Package</p>
                    <h3 className="mt-1 text-xl font-bold text-gray-900">
                      {selectedPlan.adPlanName}
                    </h3>
                    <p className="mt-1 text-sm text-gray-600">{selectedPlan.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-600">Total Amount</p>
                    <p className="mt-1 text-3xl font-bold text-primary">
                      Rs {selectedPlan.price.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <button
              key={method.id}
              onClick={() => handleSelectMethod(method.id)}
              className="group w-full overflow-hidden rounded-3xl border-2 border-gray-200 bg-white p-6 text-left shadow-lg transition-all hover:border-primary hover:shadow-2xl"
            >
              <div className="flex items-center gap-6">
                <div
                  className={cn(
                    'flex h-16 w-16 items-center justify-center rounded-2xl transition group-hover:scale-110',
                    method.iconBg
                  )}
                >
                  <method.icon className={cn('h-8 w-8', method.iconColor)} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-gray-900">{method.name}</h3>
                    {method.badge && (
                      <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-white">
                        {method.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-gray-600">{method.description}</p>
                </div>

                <div className="rounded-full bg-primary/10 p-3 transition group-hover:bg-primary group-hover:text-white">
                  <FiArrowLeft className="h-6 w-6 rotate-180" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Security Features */}
        <div className="mt-8 rounded-3xl border border-gray-200 bg-white p-8 shadow-lg">
          <h3 className="mb-6 text-center text-xl font-bold text-gray-900">
            Why our payments are secure
          </h3>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FiShield,
                title: 'SSL Encrypted',
                description: '256-bit encryption for all transactions',
              },
              {
                icon: FiCheckCircle,
                title: 'PCI DSS Compliant',
                description: 'Industry-standard security protocols',
              },
              {
                icon: FiCreditCard,
                title: '3D Secure',
                description: 'Additional layer of authentication',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                <p className="mt-1 text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}