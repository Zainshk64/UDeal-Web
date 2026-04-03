import Link from 'next/link';
import { FiHome, FiSearch } from 'react-icons/fi';
import { ROUTES, CATEGORIES } from '@/src/utils/constants';
import { GoBackButton } from '@/src/components/layout/GoBackButton';

export default function NotFound() {
  const firstCategoryId = CATEGORIES[0]?.id ?? 1;
  return (
    <div className="flex min-h-[100vh] flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-white px-4 py-16">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#F97316]">
          Error 404
        </p>
        <h1 className="mt-3 text-4xl font-bold text-slate-900 sm:text-5xl">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-slate-600">
          The page you are looking for does not exist or may have been moved. Try going home or search
          the marketplace.
        </p>
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Link
          href={ROUTES.HOME}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003049] px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-[#004d6d]"
        >
          <FiHome className="h-4 w-4" />
          Back to home
        </Link>
        <Link
          href={`${ROUTES.CATEGORY}/${firstCategoryId}`}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-[#F97316] hover:text-[#F97316]"
        >
          <FiSearch className="h-4 w-4" />
          Browse categories
        </Link>
        <GoBackButton />
      </div>

      <p className="mt-12 text-xs text-slate-400">UDealZone — Buy &amp; sell with confidence.</p>
    </div>
  );
}
