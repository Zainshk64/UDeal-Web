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
} from 'react-icons/fi';
import { useAuth } from '@/src/context/AuthContext';
import { useChat } from '@/src/context/ChatContext';
import { useChatStore, type ChatFilter } from '@/src/stores/chatStore';
import type { ChatMessage, Conversation } from '@/src/api/services/chatSystemApi';
import { getChatImageUrl } from '@/src/api/services/chatSystemApi';
import { ROUTES } from '@/src/utils/constants';
import { toast } from 'sonner';
import { cn } from '@/src/utils/cn';

const QUICK_REPLIES = [
  'Assalam o alaikum',
  'Is this still available?',
  'What is your final price?',
  'Can we meet today?',
];

const EMOJIS = ['😀', '🙂', '👍', '❤️', '🙏', '✅', '👋', '🎉'];

function filterConversations(list: Conversation[], f: ChatFilter): Conversation[] {
  if (f === 'all') return list;
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

function MessageTicks({ mine, msg }: { mine: boolean; msg: ChatMessage }) {
  if (!mine) return null;
  if (msg.isSeen) {
    return (
      <span className="ml-1 text-[10px] leading-none text-sky-200" title="Seen">
        ✓✓
      </span>
    );
  }
  if (msg.isDelivered) {
    return (
      <span className="ml-1 text-[10px] leading-none text-white/70" title="Delivered">
        ✓✓
      </span>
    );
  }
  return (
    <span className="ml-1 text-[10px] leading-none text-white/50" title="Sent">
      ✓
    </span>
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
  const listRef = useRef<HTMLDivElement>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = filterConversations(conversations, filter);
  const active = conversations.find((c) => c.id === activeId) || null;
  const messages = activeId ? messagesByConversation[activeId] || [] : [];
  const typing = activeId ? typingByConversation[activeId] : false;

  const cParam = searchParams.get('c');
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
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let w = img.width;
          let h = img.height;
          const max = 900;
          if (w > max) {
            h = (h * max) / w;
            w = max;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.72);
          URL.revokeObjectURL(url);
          if (dataUrl.length > 600_000) {
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
    <div className="flex min-h-[calc(100vh-5rem)] flex-col bg-[#e5ddd5] pt-24 md:pt-28">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-none border border-gray-200 bg-white shadow-sm md:my-4 md:max-h-[calc(100vh-7rem)] md:rounded-2xl">
        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          {/* Sidebar */}
          <aside
            className={cn(
              'flex w-full flex-shrink-0 flex-col border-gray-200 md:w-[320px] md:border-r',
              activeId ? 'hidden md:flex' : 'flex',
            )}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(ROUTES.HOME)}
                  className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
                  aria-label="Back to home"
                >
                  <FiArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-bold text-[#003049]">Chats</h1>
              </div>
              <span className="text-xs text-gray-400">
                {hubState === signalR.HubConnectionState.Connected ? '● live' : '○'}
              </span>
            </div>

            <div className="flex gap-1 border-b border-gray-100 px-2 py-2">
              {(['all', 'product', 'buyer'] as ChatFilter[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFilter(tab)}
                  className={cn(
                    'flex-1 rounded-lg py-2 text-xs font-semibold capitalize',
                    filter === tab
                      ? 'bg-[#003049] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center text-sm text-gray-500">
                  <FiMessageCircle className="h-10 w-10 text-gray-300" />
                  <p>No conversations yet</p>
                  <p className="text-xs">Open a product or buyer request and tap Chat</p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filtered.map((c) => (
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
                          'flex w-full items-center gap-3 px-3 py-3 text-left transition hover:bg-gray-50',
                          activeId === c.id && 'bg-orange-50',
                        )}
                      >
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-200">
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
                            <div className="flex h-full w-full items-center justify-center text-lg text-gray-500">
                              {(peerName(c, myId)[0] || '?').toUpperCase()}
                            </div>
                          )}
                          {c.unseenCount > 0 && (
                            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1 text-[10px] font-bold text-white">
                              {c.unseenCount > 9 ? '9+' : c.unseenCount}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-gray-900">{peerName(c, myId)}</p>
                          <p className="truncate text-xs text-gray-500">
                            {c.productTitle || 'Listing'}
                          </p>
                          <p className="truncate text-xs text-gray-400">{c.lastMessageText || '—'}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </aside>

          {/* Window */}
          <section
            className={cn(
              'relative flex min-h-0 min-w-0 flex-1 flex-col bg-[#efeae2]',
              !activeId && 'hidden md:flex',
            )}
          >
            {!active ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-gray-500">
                <FiMessageCircle className="h-14 w-14 text-gray-300" />
                <p className="font-medium">Select a chat</p>
              </div>
            ) : (
              <>
                <header className="flex flex-shrink-0 items-start gap-2 border-b border-gray-200/80 bg-[#f0f2f5] px-2 py-2 sm:px-4">
                  <button
                    type="button"
                    className="mt-1 rounded-lg p-2 text-gray-600 hover:bg-gray-200/80 md:hidden"
                    onClick={() => {
                      useChatStore.getState().setActiveConversationId(null);
                      router.replace(ROUTES.CHAT, { scroll: false });
                    }}
                    aria-label="Close chat"
                  >
                    <FiArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-gray-900">{peerName(active, myId)}</p>
                    <p className="truncate text-xs text-gray-600">{active.productTitle || 'Chat'}</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      <Link
                        href={viewItemHref}
                        className="text-xs font-semibold text-[#003049] hover:underline"
                      >
                        View item
                      </Link>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        className="text-xs font-semibold text-gray-600 hover:underline"
                        onClick={() => {
                          useChatStore.getState().setActiveConversationId(null);
                          router.push(ROUTES.HOME);
                        }}
                      >
                        Close chat
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <button
                      type="button"
                      className="rounded-lg p-2 text-gray-600 hover:bg-gray-200/80"
                      onClick={() => setMenuOpen((o) => !o)}
                      aria-label="Menu"
                    >
                      <FiMoreVertical className="h-5 w-5" />
                    </button>
                    {menuOpen && (
                      <>
                        <button
                          type="button"
                          className="fixed inset-0 z-10 cursor-default bg-transparent"
                          aria-label="Close menu"
                          onClick={() => setMenuOpen(false)}
                        />
                      <div className="absolute right-0 z-20 mt-1 w-48 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                          onClick={async () => {
                            setMenuOpen(false);
                            if (
                              confirm('Delete this entire chat? This cannot be undone.') &&
                              activeId
                            ) {
                              const ok = await deleteConv(activeId);
                              if (ok) {
                                toast.success('Chat deleted');
                                router.replace(ROUTES.CHAT, { scroll: false });
                              } else toast.error('Failed to delete chat');
                            }
                          }}
                        >
                          <FiTrash2 /> Delete chat
                        </button>
                      </div>
                      </>
                    )}
                  </div>
                </header>

                <div
                  ref={listRef}
                  onScroll={onScrollList}
                  className="chat-scrollbar min-h-0 flex-1 space-y-2 overflow-y-auto px-2 py-4 sm:px-4"
                >
                  {loadingOlder && (
                    <p className="text-center text-xs text-gray-500">Loading older messages…</p>
                  )}
                  {messages.map((m) => {
                    const mine = m.senderId === myId;
                    return (
                      <div
                        key={m.id}
                        className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                      >
                        <div
                          className={cn(
                            'group relative max-w-[85%] rounded-2xl px-3 py-2 text-sm shadow-sm sm:max-w-[70%]',
                            mine
                              ? 'rounded-br-sm bg-[#d9fdd3] text-gray-900'
                              : 'rounded-bl-sm bg-white text-gray-900',
                          )}
                        >
                          {m.messageType === 1 &&
                          (m.text.startsWith('data:image') || m.text.startsWith('http')) ? (
                            <a href={m.text} target="_blank" rel="noreferrer">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={m.text}
                                alt=""
                                className="max-h-56 max-w-full rounded-lg object-contain"
                              />
                            </a>
                          ) : (
                            <p className="whitespace-pre-wrap break-words">{m.text}</p>
                          )}
                          <div
                            className={cn(
                              'mt-1 flex items-center justify-end gap-1 text-[10px] opacity-70',
                            )}
                          >
                            <span>{new Date(m.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <MessageTicks mine={mine} msg={m} />
                          </div>
                          {mine && !m.id.startsWith('temp-') && (
                            <button
                              type="button"
                              className="absolute -left-8 top-1/2 hidden -translate-y-1/2 rounded p-1 text-gray-400 hover:bg-gray-200 group-hover:block"
                              title="Delete message"
                              onClick={async () => {
                                if (confirm('Delete this message?') && activeId) {
                                  const ok = await deleteMsg(activeId, m.id);
                                  if (!ok) toast.error('Could not delete');
                                }
                              }}
                            >
                              <FiTrash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {typing && (
                    <p className="text-xs italic text-gray-500">Typing…</p>
                  )}
                </div>

                {showScrollBottom && (
                  <button
                    type="button"
                    className="absolute bottom-24 right-6 rounded-full bg-white p-2 shadow-md md:right-10"
                    onClick={() => scrollToBottom()}
                  >
                    <FiChevronDown className="h-5 w-5 text-[#003049]" />
                  </button>
                )}

                <div className="flex-shrink-0 border-t border-gray-200/80 bg-[#f0f2f5] p-2">
                  <div className="mb-2 flex flex-wrap gap-1">
                    {QUICK_REPLIES.map((q) => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => {
                          if (activeId) void sendText(activeId, q, 0);
                        }}
                        className="rounded-full bg-white px-2 py-1 text-[11px] text-gray-700 shadow-sm hover:bg-gray-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={onPickImage}
                    />
                    <button
                      type="button"
                      className="rounded-full p-2 text-gray-600 hover:bg-gray-200/80"
                      onClick={() => fileInputRef.current?.click()}
                      aria-label="Attach image"
                    >
                      <FiImage className="h-5 w-5" />
                    </button>
                    <div className="relative">
                      <button
                        type="button"
                        className="rounded-full p-2 text-gray-600 hover:bg-gray-200/80"
                        onClick={() => setEmojiOpen((o) => !o)}
                      >
                        😊
                      </button>
                      {emojiOpen && (
                        <div className="absolute bottom-10 left-0 z-20 flex flex-wrap gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                          {EMOJIS.map((e) => (
                            <button
                              key={e}
                              type="button"
                              className="text-xl hover:scale-110"
                              onClick={() => {
                                setText((t) => t + e);
                                setEmojiOpen(false);
                              }}
                            >
                              {e}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
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
                      className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#F97316]"
                    />
                    <button
                      type="button"
                      onClick={() => void onSend()}
                      className="rounded-full bg-[#F97316] p-3 text-white shadow hover:bg-[#ea580c]"
                      aria-label="Send"
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
    </div>
  );
}
