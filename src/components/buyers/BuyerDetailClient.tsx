'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { FiArrowLeft, FiMessageCircle, FiPhone, FiEdit3 } from 'react-icons/fi';
import { toast } from 'sonner';

import { Container } from '@/src/components/ui/Container';
import { ROUTES } from '@/src/utils/constants';
import { getBuyerDetail, formatPriceRange, formatBuyerDate } from '@/src/api/services/buyerApi';
import type { BuyerDetail } from '@/src/api/services/buyerApi';
import { useAuth } from '@/src/context/AuthContext';
import { createBuyerConversation } from '@/src/api/services/chatSystemApi';

export default function BuyerDetailClient() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const id = params?.id ? Number(params.id) : 0;

  const [detail, setDetail] = useState<BuyerDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const d = await getBuyerDetail(id);
      setDetail(d);
      setLoading(false);
    })();
  }, [id]);

  const handleChat = async () => {
    if (!detail) return;
    if (!isAuthenticated) {
      toast.info('Login Required', {
        description: 'Please login to chat about this request',
      });
      router.push(ROUTES.LOGIN);
      return;
    }
    const uid = user?.userId;
    if (!uid) return;
    toast.info('Starting chat…', { duration: 1500 });
    const conversationId = await createBuyerConversation(detail.ProductReqId, uid);
    if (!conversationId || typeof conversationId !== 'string') {
      toast.error('Chat Error', {
        description: 'Failed to create conversation',
      });
      return;
    }
    const qs = new URLSearchParams({
      c: conversationId,
      back: pathname || `${ROUTES.BUYERS}/${detail.ProductReqId}`,
      type: 'buyer',
      peerName: detail.BuyerName || 'Buyer',
      productTitle: detail.RequiredTitle || 'Buyer request',
      viewUrl: `${ROUTES.BUYERS}/${detail.ProductReqId}`,
    });
    router.push(`${ROUTES.CHAT}?${qs.toString()}`);
  };

  const handleCall = () => {
    if (!detail?.ContactNo) return;
    const raw = detail.ContactNo.replace(/\D/g, '');
    if (!raw) {
      toast.error('No phone number on file');
      return;
    }
    window.location.href = `tel:${raw.startsWith('92') ? '+' : ''}${raw}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-24">
        <Container>
          <div className="mx-auto max-w-3xl animate-pulse space-y-4">
            <div className="h-10 w-2/3 rounded-lg bg-gray-200" />
            <div className="h-32 rounded-2xl bg-gray-200" />
            <div className="h-48 rounded-2xl bg-gray-200" />
          </div>
        </Container>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-gray-50 py-24 text-center">
        <Container>
          <p className="text-lg font-semibold text-gray-800">Request not found</p>
          <Link
            href={ROUTES.BUYERS}
            className="mt-4 inline-flex cursor-pointer  items-center gap-2 text-[#003049] hover:underline"
          >
            <FiArrowLeft /> Back to buyers
          </Link>
        </Container>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 ">
      <section className="border-b border-gray-200 pt-32 pb-10 bg-white">
        <Container className="py-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-4 cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#003049]"
          >
            <FiArrowLeft className="h-4 w-4" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">{detail.RequiredTitle}</h1>
          <p className="mt-2 text-sm text-gray-500">
            {detail.CategoryName} · {detail.SubCategoryName} · Posted {formatBuyerDate(detail.CreatedDateTime)}
          </p>
        </Container>
      </section>

      <Container className="mt-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 pb-10 space-y-6">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Description</h2>
              <p className="mt-3 whitespace-pre-wrap text-gray-800">{detail.ProductDescription}</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500">Details</h2>
              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-gray-500">Budget</dt>
                  <dd className="font-semibold text-[#003049]">{formatPriceRange(detail.PriceRange)}</dd>
                </div>
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">{detail.Address}</dd>
                </div>
                {detail.ConditionName && (
                  <div>
                    <dt className="text-gray-500">Condition</dt>
                    <dd>{detail.ConditionName}</dd>
                  </div>
                )}
                {detail.BedRooms != null && (
                  <div>
                    <dt className="text-gray-500">Bedrooms</dt>
                    <dd>{detail.BedRooms}</dd>
                  </div>
                )}
                {detail.Washrooms != null && (
                  <div>
                    <dt className="text-gray-500">Washrooms</dt>
                    <dd>{detail.Washrooms}</dd>
                  </div>
                )}
                {detail.IsFurnished && (
                  <div>
                    <dt className="text-gray-500">Furnished</dt>
                    <dd>{detail.IsFurnished}</dd>
                  </div>
                )}
                {detail.UnitAreaRange && (
                  <div>
                    <dt className="text-gray-500">Area</dt>
                    <dd>{detail.UnitAreaRange}</dd>
                  </div>
                )}
                {detail.Duration && (
                  <div>
                    <dt className="text-gray-500">Duration</dt>
                    <dd>{detail.Duration}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-gray-500">Posted by</p>
              <p className="mt-1 text-lg font-semibold text-gray-900">{detail.BuyerName}</p>

              {detail.IsOwner ? (
                <div className="mt-6 flex flex-col gap-2">
                  <p className="text-xs text-gray-500">This is your request.</p>
                  <Link
                    href={`${ROUTES.BUYERS_POST}?edit=${detail.ProductReqId}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold hover:border-[#F97316]"
                  >
                    <FiEdit3 /> Edit request
                  </Link>
                  <Link
                    href={ROUTES.BUYERS_MY_REQUESTS}
                    className="text-center text-sm text-[#003049] hover:underline"
                  >
                    Manage in My requests
                  </Link>
                </div>
              ) : (
                <div className="mt-6 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleCall}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003049] py-3 text-sm font-semibold text-white hover:bg-[#004d6d]"
                  >
                    <FiPhone /> Call
                  </button>
                  <button
                    type="button"
                    onClick={handleChat}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-800 hover:border-[#F97316]"
                  >
                    <FiMessageCircle /> Chat
                  </button>
                  {!isAuthenticated && (
                    <p className="text-center text-xs text-gray-500">Sign in for more actions soon.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
