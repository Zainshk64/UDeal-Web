'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatDashboardClient from '@/src/components/chat/ChatDashboardClient';
import { useAuth } from '@/src/context/AuthContext';
import { ROUTES } from '@/src/utils/constants';

export default function ChatPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#111b21]">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
      </div>
    );
  }

  return <ChatDashboardClient />;
}
