import { Suspense } from 'react';
import ChatPageClient from './ChatPageClient';

export const dynamic = 'force-dynamic';

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#111b21]">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        </div>
      }
    >
      <ChatPageClient />
    </Suspense>
  );
}
