'use client';

import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { ROUTES } from '@/src/utils/constants';

export function GoBackButton() {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() =>
        typeof window !== 'undefined' && window.history.length > 1
          ? router.back()
          : router.push(ROUTES.HOME)
      }
      className="inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-600 hover:text-[#003049]"
    >
      <FiArrowLeft className="h-4 w-4" />
      Go back
    </button>
  );
}
