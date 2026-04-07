'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FiEdit3, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import { Container } from '@/src/components/ui/Container';
import { ROUTES } from '@/src/utils/constants';
import { useAuth } from '@/src/context/AuthContext';
import {
  getMyBuyerRequests,
  deleteBuyerRequest,
  type BuyerRequest,
} from '@/src/api/services/buyerPostApi';
import { formatCurrency } from '@/src/utils/format';
import { formatBuyerDate } from '@/src/api/services/buyerApi';
import { EditBuyerRequestModal } from '@/src/components/buyers/EditBuyerRequestModal';

export default function MyBuyerRequestsClient() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [list, setList] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editRow, setEditRow] = useState<BuyerRequest | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      router.replace(ROUTES.LOGIN);
      return;
    }
    if (!user?.userId) return;
    (async () => {
      setLoading(true);
      const data = await getMyBuyerRequests(user.userId!);
      setList(data);
      setLoading(false);
    })();
  }, [authLoading, isAuthenticated, user?.userId, router]);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    const ok = await deleteBuyerRequest(deleteId);
    setDeleting(false);
    setDeleteId(null);
    if (ok && user?.userId) {
      setList((prev) => prev.filter((r) => r.productReqId !== deleteId));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24">
        <Container>
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-2 border-[#003049] border-t-transparent" />
        </Container>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 ">
      <section className="border-b border-gray-200  bg-white pt-32 pb-10">
        <Container>
          <Link href={ROUTES.BUYERS} className="text-sm cursor-pointer text-[#003049] hover:underline">
            ← Back to buyers
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-gray-900 md:text-3xl">My requests</h1>
          <p className="mt-2 text-sm text-gray-600">
            Edit or remove your buyer posts. Sellers can still see active requests until you delete them.
          </p>
        </Container>
      </section>

      <Container className="mt-8">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-16 text-center">
            <FiShoppingBag className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 font-semibold text-gray-800">No requests yet</p>
            <Link
              href={ROUTES.BUYERS_POST}
              className="mt-4 inline-block rounded-xl bg-[#F97316] px-6 py-3 font-semibold text-white"
            >
              Post a request
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {list.map((r) => (
              <li
                key={r.productReqId}
                className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-gray-900">
                    {r.prodcutTitle || 'Untitled request'}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {r.categoryName && r.subCategoryName
                      ? `${r.categoryName} · ${r.subCategoryName}`
                      : 'Buyer request'}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[#003049]">
                    {typeof r.price === 'number' && typeof r.priceTo === 'number'
                      ? `${formatCurrency(Number(r.price))} – ${formatCurrency(Number(r.priceTo))}`
                      : '—'}
                  </p>
                  {r.createdDateTime && (
                    <p className="mt-1 text-xs text-gray-400">
                      {formatBuyerDate(r.createdDateTime)}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditRow(r);
                      setEditOpen(true);
                    }}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-[#F97316]"
                  >
                    <FiEdit3 /> Edit
                  </button>
                  <Link
                    href={`${ROUTES.BUYERS}/${r.productReqId}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#003049]"
                  >
                    View
                  </Link>
                  <button
                    type="button"
                    onClick={() => setDeleteId(r.productReqId)}
                    className="inline-flex items-center gap-2 rounded-xl cursor-pointer border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100"
                  >
                    <FiTrash2 /> Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Container>

      {user?.userId != null && (
        <EditBuyerRequestModal
          open={editOpen}
          onOpenChange={(o) => {
            setEditOpen(o);
            if (!o) setEditRow(null);
          }}
          row={editRow}
          userId={user.userId}
          onSaved={(updated) => {
            setList((prev) =>
              prev.map((item) =>
                item.productReqId === updated.productReqId ? { ...item, ...updated } : item,
              ),
            );
          }}
        />
      )}

      {deleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-900">Delete request?</h3>
            <p className="mt-2 text-sm text-gray-600">
              This cannot be undone. Sellers will no longer see this buyer post.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteId(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
