'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiAlertTriangle, FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { deleteAccount } from '@/src/api/services/AuthApi';
import { useAuth } from '@/src/context/AuthContext';
import { clearAllStorage } from '@/src/utils/storage';
import { ROUTES } from '@/src/utils/constants';

export default function AccountDeletionRequestPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteSuccessRedirecting, setIsDeleteSuccessRedirecting] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isDeleteSuccessRedirecting) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, isDeleteSuccessRedirecting, router]);

  useEffect(() => {
    if (user?.email) {
      setEmail(user.email);
    }
  }, [user?.email]);

  const canSubmit = useMemo(() => {
    return email.trim().length > 0 && password.length > 0 && confirmChecked && !isSubmitting;
  }, [email, password, confirmChecked, isSubmitting]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Email is required.');
      return;
    }

    if (!password) {
      toast.error('Password is required.');
      return;
    }

    if (!confirmChecked) {
      toast.error('Please confirm account deletion to continue.');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await deleteAccount(email, password);
      if (!result.success) return;

      setIsDeleteSuccessRedirecting(true);
      clearAllStorage();
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      logout();
      if (typeof window !== 'undefined') {
        window.location.replace(ROUTES.HOME);
        return;
      }

      router.replace(ROUTES.HOME);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoading && !isAuthenticated) return null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-28">
      <section className="mx-auto w-full max-w-xl rounded-2xl border border-red-200 bg-white p-6 shadow-lg">
        <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
          <FiAlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h1 className="text-xl font-bold">Delete Account</h1>
            <p className="mt-1 text-sm text-red-800">
              This action is permanent. Your account and related data will be removed and you will be logged out.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="delete-email" className="mb-2 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="delete-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="delete-password" className="mb-2 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="delete-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-red-500 focus:outline-none"
              placeholder="Enter your password"
            />
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-gray-200 p-3 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span>I understand this action cannot be undone and I want to permanently delete my account.</span>
          </label>

          <button
            type="submit"
            disabled={!canSubmit}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600 py-2.5 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <FiTrash2 />
            {isSubmitting ? 'Deleting account...' : 'Delete My Account'}
          </button>
        </form>
      </section>
    </main>
  );
}
