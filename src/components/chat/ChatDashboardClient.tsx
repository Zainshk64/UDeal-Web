// src/components/chat/ChatDashboardClient.tsx
'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import * as signalR from '@microsoft/signalr';
import {
  FiArrowLeft,
  FiChevronDown,
  FiImage,
  FiMessageCircle,
  FiMoreVertical,
  FiSend,
  FiTrash2,
  FiX,
  FiSmile,
  FiPaperclip,
  FiCheck,
  FiSearch,
} from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { useChat } from '@/src/context/ChatContext';
import { useChatStore, type ChatFilter } from '@/src/stores/chatStore';
import type { ChatMessage, Conversation } from '@/src/api/services/chatSystemApi';
import { getChatImageUrl } from '@/src/api/services/chatSystemApi';
import { ROUTES } from '@/src/utils/constants';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';
import { formatDateTimePK, formatTimePK } from '@/src/utils/datePk';

const QUICK_REPLIES = [
  'Assalam o alaikum',
  'Is this still available?',
  'What is your final price?',
  'Can we meet today?',
];

const EMOJIS = ['😀', '😂', '😊', '😍', '🥰', '😘', '🤗', '🤔', '👍', '👏', '🙏', '❤️', '🔥', '✅', '👋', '🎉', '🚀', '💯'];

function filterConversations(list: Conversation[], f: ChatFilter): Conversation[] {
  if (f === 'buyer') return list.filter((c) => c.type === 1 || c.label?.toLowerCase() === 'buyer');
  return list.filter((c) => c.type === 0 || c.label?.toLowerCase() === 'product' || c.type == null);
}

function peerName(c: Conversation, myId: number): string {
  if (c.buyerId === myId) return c.sellerName || 'Seller';
  return c.buyerName || 'Buyer';
}

function peerAvatar(c: Conversation, myId: number): string | undefined {
  if (c.buyerId === myId) return c.sellerImageUrl;
  return c.buyerImageUrl;
}

function chatPreview(text: string | null | undefined): string {
  if (!text) return 'No messages yet';
  if (text.startsWith('data:image') || text.startsWith('http')) return '📷 Photo';
  return text;
}

function MessageTicks({ mine, msg }: { mine: boolean; msg: ChatMessage }) {
  if (!mine) return null;
  
  // Pending (clock icon for temp messages)
  if (msg.id.startsWith('temp-')) {
    return (
      <svg className="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  // Read (blue double check)
  if (msg.isSeen) {
    return (
      <svg className="ml-1 h-4 w-4 text-primary" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l7 7 11-11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12l7 7 11-11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Delivered (gray double check)
  if (msg.isDelivered) {
    return (
      <svg className="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 12l7 7 11-11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 12l7 7 11-11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  // Sent (single gray check)
  return (
    <svg className="ml-1 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ChatDashboardClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const myId = user?.userId ?? 0;
  const {
    selectConversation,
    loadOlderMessages,
    sendText,
    sendTyping,
    deleteConv,
    deleteMsg,
    hubState,
    isUserOnline,
  } = useChat();

  const filter = useChatStore((s) => s.filter);
  const setFilter = useChatStore((s) => s.setFilter);
  const conversations = useChatStore((s) => s.conversations);
  const activeId = useChatStore((s) => s.activeConversationId);
  const messagesByConversation = useChatStore((s) => s.messagesByConversation);
  const messageHasMore = useChatStore((s) => s.messageHasMore);
  const typingByConversation = useChatStore((s) => s.typingByConversation);

  const [text, setText] = useState('');
  const [loadingOlder, setLoadingOlder] = useState(false);
  const loadingOlderRef = useRef(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [pendingDeleteMsgId, setPendingDeleteMsgId] = useState<string | null>(null);
  const [pendingDeleteChat, setPendingDeleteChat] = useState(false);

  const cParam = searchParams.get('c');
  const backUrl = searchParams.get('back') || ROUTES.HOME;
  const draftPeerName = searchParams.get('peerName') || 'User';
  const draftProductTitle = searchParams.get('productTitle') || 'Listing';
  const draftProductImage = searchParams.get('productImage') || '';
  const draftViewUrl = searchParams.get('viewUrl') || '';
  const filtered = filterConversations(conversations, filter).filter((c) =>
    peerName(c, myId).toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.productTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const active = conversations.find((c) => c.id === activeId) || null;
  const draftActive = !active && activeId === cParam && !!cParam;
  const activePeerId = active ? (active.buyerId === myId ? active.sellerId : active.buyerId) : 0;
  const messages = activeId ? messagesByConversation[activeId] || [] : [];
  const typing = activeId ? typingByConversation[activeId] : false;

  const filterUnreadSum = (f: ChatFilter) =>
    filterConversations(conversations, f).reduce((n, c) => {
      if (c.id === activeId) return n;
      return n + (c.unseenCount || 0);
    }, 0);

  useEffect(() => {
    if (!cParam) {
      useChatStore.getState().setActiveConversationId(null);
      return;
    }
    void selectConversation(cParam);
  }, [cParam, selectConversation]);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? 'smooth' : 'auto' });
  }, []);

  useEffect(() => {
    if (activeId) {
      requestAnimationFrame(() => scrollToBottom(false));
    }
  }, [activeId, messages.length, scrollToBottom]);

  const onScrollList = () => {
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    setShowScrollBottom(!nearBottom && messages.length > 0);
    if (el.scrollTop < 80 && activeId && messageHasMore[activeId] && !loadingOlderRef.current) {
      void (async () => {
        loadingOlderRef.current = true;
        setLoadingOlder(true);
        const prevH = el.scrollHeight;
        await loadOlderMessages(activeId);
        setLoadingOlder(false);
        loadingOlderRef.current = false;
        requestAnimationFrame(() => {
          const newH = el.scrollHeight;
          el.scrollTop = newH - prevH;
        });
      })();
    }
  };

  const onSend = async () => {
    if (!activeId || !text.trim()) return;
    const ok = await sendText(activeId, text, 0);
    if (!ok) toast.error('Message failed to send');
    setText('');
    sendTyping(activeId, false);
    scrollToBottom();
  };

  const onTyping = (v: string) => {
    setText(v);
    if (!activeId) return;
    sendTyping(activeId, true);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => sendTyping(activeId, false), 2000);
  };

  const compressImageFile = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const max = 1200;
          if (w > max || h > max) {
            if (w > h) {
              h = (h * max) / w;
              w = max;
            } else {
              w = (w * max) / h;
              h = max;
            }
          }
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            URL.revokeObjectURL(url);
            reject(new Error('canvas'));
            return;
          }
          ctx.drawImage(img, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          URL.revokeObjectURL(url);
          if (dataUrl.length > 800_000) {
            reject(new Error('too large'));
            return;
          }
          resolve(dataUrl);
        } catch (e) {
          URL.revokeObjectURL(url);
          reject(e);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('load'));
      };
      img.src = url;
    });

  const onPickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !activeId) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file');
      return;
    }
    try {
      const dataUrl = await compressImageFile(file);
      const ok = await sendText(activeId, dataUrl, 1);
      if (!ok) toast.error('Could not send image');
      else scrollToBottom();
    } catch {
      toast.error('Image too large or invalid');
    }
  };

  const viewItemHref = active
    ? active.type === 1 || active.label?.toLowerCase() === 'buyer'
      ? `${ROUTES.BUYERS}/${active.productId}`
      : `${ROUTES.PRODUCT_DETAIL}/${active.productId}`
    : ROUTES.HOME;

  return (
    <div className="flex h-screen flex-col bgnt-to-br from-primary via-primary/95 to-primary/90">
      <div className="mx-auto flex w-full max-w-[1600px] flex-1 flex-col overflow-hidden rounded-t-3xl shadow-2xl">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row bg-white">
          {/* ============================================
              SIDEBAR - CONVERSATIONS LIST
              ============================================ */}
          <aside
            className={cn(
              'flex w-full flex-shrink-0 flex-col border- border-gray-200 bg-white md:w-[min(100%,420px)]',
              activeId ? 'hidden md:flex' : 'flex',
            )}
          >
            {/* Header */}
            <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[#003049] px-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => router.push(backUrl)}
                  className="rounded-full p-2.5 text-white/90 transition hover:bg-white/10"
                  aria-label="Back"
                >
                  <FiArrowLeft className="h-6 w-6" />
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-white">Messages</h1>
                  <p className="text-xs text-white/70">All your conversations</p>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-semibold transition-all',
                  hubState === signalR.HubConnectionState.Connected
                    ? 'bg-green-500/20 text-green-600 shadow-lg shadow-green-500/20'
                    : 'bg-gray-200 text-gray-600',
                )}
              >
                {hubState === signalR.HubConnectionState.Connected ? '● Live' : '○ Offline'}
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-4 py-3">
              <div className="flex items-center gap-2.5 rounded-full bg-gray-100 px-4 py-2.5 transition focus-within:bg-primary/5 focus-within:ring-2 focus-within:ring-primary/20">
                <FiSearch className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex-shrink-0 border-b border-gray-200 bg-white px-3 py-3">
              <div className="flex gap-2">
                {(['product', 'buyer'] as const).map((tab) => {
                  const count = filterUnreadSum(tab);
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setFilter(tab)}
                      className={cn(
                        'relative flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold uppercase tracking-wide transition-all',
                        filter === tab
                          ? 'bg-[#003049] text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                      )}
                    >
                      {tab === 'product' ? 'Products' : 'Buyers'}
                      {count > 0 && (
                        <span className={cn(
                          'ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-bold',
                          filter === tab
                            ? 'bg-accent text-white'
                            : 'bg-accent/20 text-accent'
                        )}>
                          {count > 99 ? '99+' : count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conversations List */}
            <div className="min-h-0 flex-1 overflow-y-auto bg-white">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-4 px-6 py-20 text-center">
                  <div className="rounded-2xl bg-gray-100 p-6">
                    <FiMessageCircle className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-gray-900">No conversations</p>
                    <p className="text-sm text-gray-600">Start a chat from a product or buyer request</p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtered.map((c) => {
                    const rowTyping = typingByConversation[c.id];
                    const effectiveUnseen = activeId === c.id ? 0 : c.unseenCount || 0;
                    const isUnread = effectiveUnseen > 0;
                    const peerOnline = isUserOnline(c.buyerId === myId ? c.sellerId : c.buyerId);
                    
                    return (
                      <li key={c.id}>
                        <button
                          type="button"
                          onClick={() => {
                            selectConversation(c.id);
                            router.replace(`${ROUTES.CHAT}?c=${encodeURIComponent(c.id)}`, {
                              scroll: false,
                            });
                          }}
                          className={cn(
                            'flex w-full items-start gap-4 px-4 py-3 text-left transition-all duration-200',
                            activeId === c.id
                              ? 'bg-gradient-to-r from-primary/5 to-accent/5 border-l-4 border-accent'
                              : 'hover:bg-gray-50',
                          )}
                        >
                          {/* Avatar */}
                          <div className="relative h-12 w-12 shrink-0">
                            <div className="h-12 w-12 overflow-hidden rounded-full bg-gradient-to-br from-primary/20 to-accent/20 ring-2 ring-white">
                              {peerAvatar(c, myId) ? (
                                <Image
                                  src={getChatImageUrl(peerAvatar(c, myId))}
                                  alt=""
                                  width={48}
                                  height={48}
                                  className="h-12 w-12 object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-bold text-primary">
                                  {(peerName(c, myId)[0] || '?').toUpperCase()}
                                </div>
                              )}
                            </div>
                            {peerOnline && (
                              <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500 shadow-lg" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p
                                className={cn(
                                  'truncate text-[15px]',
                                  isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800',
                                )}
                              >
                                {peerName(c, myId)}
                              </p>
                              <span className={cn(
                                'shrink-0 text-xs whitespace-nowrap',
                                isUnread ? 'font-semibold text-primary' : 'text-gray-500'
                              )}>
                                {formatDateTimePK(c.lastMessageAt ?? null)}
                              </span>
                            </div>
                            <p className="truncate text-xs text-gray-500 mb-1">
                              {c.productTitle || 'Listing'}
                            </p>
                            <div className="flex items-center justify-between gap-2">
                              <p
                                className={cn(
                                  'truncate text-sm',
                                  isUnread ? 'font-semibold text-gray-900' : 'text-gray-600',
                                  rowTyping && 'italic text-primary font-medium',
                                )}
                              >
                                {rowTyping ? 'typing...' : chatPreview(c.lastMessageText)}
                              </p>
                              {effectiveUnseen > 0 && (
                                <span className="flex h-6 min-w-[24px] shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-accent to-accent-dark px-2 text-xs font-bold text-white shadow-lg">
                                  {effectiveUnseen > 99 ? '99+' : effectiveUnseen}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* ============================================
              CHAT WINDOW
              ============================================ */}
          <section
            className={cn(
              'relative flex min-h-0 min-w-0 flex-1 flex-col bg-white',
              !activeId && 'hidden md:flex',
            )}
          >
            {!active && !draftActive ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
                <div className="rounded-3xl bg-gradient-to-br from-primary/10 to-accent/10 p-12">
                  <FiMessageCircle className="h-24 w-24 text-primary/30" />
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-gray-900">UDealZone Chat</p>
                  <p className="mt-2 text-gray-600">
                    Select a conversation to start chatting
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <header className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 bg-[#003049] px-3 py-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="rounded-full p-2 text-white/90 hover:bg-white/10 md:hidden transition"
                      onClick={() => {
                        useChatStore.getState().setActiveConversationId(null);
                        router.replace(ROUTES.CHAT, { scroll: false });
                      }}
                      aria-label="Back"
                    >
                      <FiArrowLeft className="h-6 w-6" />
                    </button>
                    
                    <div className="relative h-12 w-12">
                      <div className="h-12 w-12 overflow-hidden rounded-full bg-[#003049]ring-2 ring-white/30">
                        {(active ? peerAvatar(active, myId) : null) ? (
                          <Image
                            src={getChatImageUrl(peerAvatar(active!, myId))}
                            alt=""
                            width={48}
                            height={48}
                            className="h-12 w-12 object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-lg font-bold text-white">
                            {(active ? peerName(active, myId)[0] : draftPeerName[0] || '?').toUpperCase()}
                          </div>
                        )}
                      </div>
                      {active && activePeerId && isUserOnline(activePeerId) && (
                        <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 shadow-lg" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-white">
                        {active ? peerName(active, myId) : draftPeerName}
                      </p>
                      <p className="truncate text-xs text-white/70">
                        {typing
                          ? 'typing...'
                          : active && activePeerId && isUserOnline(activePeerId)
                            ? 'online'
                            : 'offline'}
                      </p>
                    </div>
                  </div>

                  {/* Header Menu */}
                  <div className="relative">
                    <button
                      type="button"
                      className="rounded-full p-2.5 text-white/90 hover:bg-white/10 transition"
                      onClick={() => setMenuOpen((o) => !o)}
                      aria-label="Menu"
                    >
                      <FiMoreVertical className="h-6 w-6" />
                    </button>
                    {menuOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default bg-transparent"
                          aria-label="Close menu"
                          onClick={() => setMenuOpen(false)}
                        />
                        <div className="absolute right-0 z-20 mt-2 min-w-[220px] overflow-hidden rounded-2xl border border-gray-200 bg-white py-2 shadow-2xl">
                          <button
                            type="button"
                            className="flex w-full px-5 py-3 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
                            onClick={() => {
                              setMenuOpen(false);
                              useChatStore.getState().setActiveConversationId(null);
                              router.replace(ROUTES.CHAT, { scroll: false });
                            }}
                          >
                            Close chat
                          </button>
                          <hr className="my-1 border-gray-200" />
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 px-5 py-3 text-left text-sm font-medium text-red-600 hover:bg-red-50 transition"
                            onClick={() => {
                              setMenuOpen(false);
                              setPendingDeleteChat(true);
                            }}
                          >
                            <FiTrash2 className="h-4 w-4" />
                            Delete chat
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </header>

                {/* Messages Container */}
                <div
                  ref={listRef}
                  onScroll={onScrollList}
                  className="chat-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-8"
                  style={{
                    backgroundImage: 'url(/chat-bg.jpg)',
                    backgroundSize: 'contain',
                    backgroundAttachment: 'fixed',
                    backgroundPosition: 'center',
                  }}
                >
                  {/* Loading indicator */}
                  {loadingOlder && (
                    <div className="flex justify-center py-4">
                      <div className="rounded-full bg-white/80 px-4 py-2 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm">
                        Loading older messages...
                      </div>
                    </div>
                  )}

                  {/* Messages */}
                  {messages.map((m, idx) => {
                    const mine = m.senderId === myId;
                    const showDate =
                      idx === 0 ||
                      new Date(messages[idx - 1].sentAt).toDateString() !==
                        new Date(m.sentAt).toDateString();

                    return (
                      <React.Fragment key={m.id}>
                        {showDate && (
                          <div className="flex justify-center py-3">
                            <div className="rounded-full bg-white/70 px-4 py-1.5 text-xs font-semibold text-gray-600 shadow-sm backdrop-blur-sm">
                              {new Date(m.sentAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: new Date(m.sentAt).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
                              })}
                            </div>
                          </div>
                        )}

                        <div className={cn('flex', mine ? 'justify-end' : 'justify-start')}>
                          <div
                            className={cn(
                              'group relative max-w-[85%] rounded-3xl px-4 py-2.5 shadow-md transition-all sm:max-w-[65%]',
                              mine
                                ? 'rounded-br-none bg-[#003049] text-white'
                                : 'rounded-bl-none bg-white text-gray-900 shadow-lg',
                              m.id.startsWith('temp-') && 'opacity-70',
                            )}
                          >
                            {m.messageType === 1 &&
                            (m.text.startsWith('data:image') || m.text.startsWith('http')) ? (
                              <button
                                type="button"
                                onClick={() => setLightboxSrc(m.text)}
                                className="overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-accent/50"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={m.text}
                                  alt=""
                                  className="max-h-96 w-full max-w-sm rounded-2xl object-cover"
                                />
                              </button>
                            ) : (
                              <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                                {m.text}
                              </p>
                            )}

                            {/* Time and Ticks */}
                            <div className={cn(
                              'mt-1.5 flex items-center justify-end gap-1 text-[12px]',
                              mine ? 'text-white/80' : 'text-gray-500'
                            )}>
                              <span>{formatTimePK(m.sentAt)}</span>
                              <MessageTicks mine={mine} msg={m} />
                            </div>

                            {/* Delete Button */}
                            {mine && !m.id.startsWith('temp-') && (
                              <button
                                type="button"
                                className="absolute -left-10 top-1/2  -translate-y-1/2 rounded-full p-2 text-gray-400 hover:bg-gray-200 hover:text-gray-600 group-hover:block transition"
                                title="Delete message"
                                onClick={() => setPendingDeleteMsgId(m.id)}
                              >
                                <FiTrash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}

                  {/* Typing Indicator */}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="flex items-center gap-2 rounded-3xl rounded-bl-none bg-white px-5 py-3 shadow-lg">
                        <div className="flex gap-1.5">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '0ms' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '150ms' }} />
                          <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Scroll to Bottom Button */}
                {showScrollBottom && (
                  <button
                    type="button"
                    className="absolute bottom-32 right-6 rounded-full bg-primary p-3 text-white shadow-2xl transition-all hover:scale-110 hover:shadow-xl md:right-10"
                    onClick={() => scrollToBottom()}
                  >
                    <FiChevronDown className="h-5 w-5" />
                  </button>
                )}

                {/* Input Area */}
                <div className="flex-shrink-0 border-t border-gray-200 bg-white p-3 sm:p-4">
                  {/* Product Preview */}
                  <div className="mb-3 flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3 transition hover:bg-gray-100">
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
                      {(active?.productImageUrl || draftProductImage) && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={getChatImageUrl(active?.productImageUrl || draftProductImage)}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                        {active?.type === 1 ? 'Buyer Request' : 'Product'}
                      </p>
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {active?.productTitle || draftProductTitle}
                      </p>
                    </div>
                    <Link
                      href={active ? viewItemHref : draftViewUrl || '#'}
                      className="shrink-0 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:shadow-xl"
                    >
                      View
                    </Link>
                  </div>

                  {/* Quick Replies */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          if (activeId) void sendText(activeId, q, 0);
                        }}
                        className="rounded-full border border-gray-300 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 hover:border-primary active:scale-95"
                      >
                        {q}
                      </button>
                    ))}
                  </div>

                  {/* Input Controls */}
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickImage}
                    />

                    {/* Emoji Button */}
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-full p-2.5 text-gray-600 transition hover:bg-gray-100"
                        onClick={() => setEmojiOpen((o) => !o)}
                      >
                        <FiSmile className="h-6 w-6" />
                      </button>
                      {emojiOpen && (
                        <>
                          <button
                            type="button"
                            className="fixed inset-0 z-10"
                            onClick={() => setEmojiOpen(false)}
                          />
                          <div className="absolute bottom-14 left-0 z-20 grid max-w-xs grid-cols-8 gap-1 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl">
                            {EMOJIS.map((e) => (
                              <button
                                key={e}
                                type="button"
                                className="rounded-lg p-2 text-2xl transition hover:scale-125 hover:bg-gray-100"
                                onClick={() => {
                                  setText((t) => t + e);
                                  setEmojiOpen(false);
                                }}
                              >
                                {e}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>

                    {/* Image Button */}
                    <button
                      type="button"
                      className="rounded-full p-2.5 text-gray-600 transition hover:bg-gray-100"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach image"
                    >
                      <FiImage className="h-6 w-6" />
                    </button>

                    {/* Message Input */}
                    <textarea
                      value={text}
                      onChange={(e) => onTyping(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          void onSend();
                        }
                      }}
                      rows={1}
                      placeholder="Type a message"
                      className="max-h-32 min-h-[48px] w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-gray-500 transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    {/* Send Button */}
                    <button
                      type="button"
                      onClick={() => void onSend()}
                      disabled={!text.trim()}
                      className="rounded-full bg-accent p-3 text-white shadow-lg transition hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      <FiSend className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>

      {/* ============================================
          DIALOGS & MODALS
          ============================================ */}

      {/* Image Lightbox */}
      {lightboxSrc && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm"
          onClick={() => setLightboxSrc(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20"
            aria-label="Close"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxSrc(null);
            }}
          >
            <FiX className="h-6 w-6" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lightboxSrc}
            alt=""
            className="max-h-[90vh] max-w-full rounded-3xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Delete Message Dialog */}
      {pendingDeleteMsgId && (
        <div
          className="fixed inset-0 z-[280] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPendingDeleteMsgId(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <FiTrash2 className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-center text-gray-900">Delete message?</p>
            <p className="mt-2 text-center text-sm text-gray-600">This action cannot be undone.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setPendingDeleteMsgId(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-lg"
                onClick={async () => {
                  if (!activeId || !pendingDeleteMsgId) return;
                  const ok = await deleteMsg(activeId, pendingDeleteMsgId);
                  setPendingDeleteMsgId(null);
                  if (!ok) toast.error('Could not delete message');
                  else toast.success('Message deleted');
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Chat Dialog */}
      {pendingDeleteChat && (
        <div
          className="fixed inset-0 z-[280] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setPendingDeleteChat(false)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mx-auto mb-4">
              <FiMessageCircle className="h-6 w-6 text-red-600" />
            </div>
            <p className="text-xl font-bold text-center text-gray-900">Delete entire chat?</p>
            <p className="mt-2 text-center text-sm text-gray-600">All messages will be permanently removed.</p>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                className="rounded-xl px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                onClick={() => setPendingDeleteChat(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="rounded-xl bg-red-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition shadow-lg"
                onClick={async () => {
                  if (!activeId) return;
                  const ok = await deleteConv(activeId);
                  setPendingDeleteChat(false);
                  if (ok) {
                    toast.success('Chat deleted');
                    router.replace(ROUTES.CHAT, { scroll: false });
                  } else toast.error('Failed to delete chat');
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}