'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronUp, FiSend, FiX } from 'react-icons/fi';

const BOT_AVATAR_URL =
  'https://res.cloudinary.com/daljxhxzf/image/upload/v1771020713/chatbot-new_fmcuqv.png';

const WELCOME_MESSAGE = "I'm UDeal AI Assistant and How can i help you?";

type Msg = { id: string; role: 'user' | 'assistant'; text: string };

export function FloatingSiteWidgets() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Msg[]>([
    { id: '1', role: 'assistant', text: WELCOME_MESSAGE },
  ]);
  const [showBackTop, setShowBackTop] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setShowBackTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const send = () => {
    const t = input.trim();
    if (!t) return;
    setInput('');
    const uid = `u-${Date.now()}`;
    setMessages((m) => [...m, { id: uid, role: 'user', text: t }]);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text:
            'Thanks for your message. Our team reviews chat inquiries regularly. For urgent help, contact support through the app.',
        },
      ]);
    }, 600);
  };

  return (
    <>
      {/* Back to top — centered horizontal, bottom of viewport */}
      <AnimatePresence>
        {showBackTop && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-28 left-1/2 z-[45] hover:bg-accent cursor-pointer hover:text-white flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-white/20 bg-white/70 text-slate-600 shadow-md backdrop-blur-md opacity-70 transition hover:opacity-100 md:bottom-8 md:h-11 md:w-11"
            aria-label="Back to top"
          >
            <FiChevronUp className="h-5 w-5 " />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat launcher + panel */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 md:bottom-6 md:right-6">
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="mb-1 flex w-[min(100vw-2rem,380px)] max-h-[min(100vh,520px)] flex-col overflow-hidden rounded-2xl  border-slate-200/80 bg-white shadow-2xl"
            >
              <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-[#003049] to-[#004d6d] px-4 py-3 text-white">
                <div className="relative h-10 cursor-pointer w-10 flex-shrink-0 overflow-hidden rounded-full">
                  <Image
                    src={BOT_AVATAR_URL}
                    alt=""
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">UDeal AI Assistant</p>
                  <p className="truncate text-xs text-white/75">Ask us anything</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg p-2 hover:bg-white/10"
                  aria-label="Close chat"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>
              <div
                ref={listRef}
                className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-3"
                style={{ maxHeight: 'min(52vh, 420px)' }}
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[min(100%,280px)] rounded-2xl px-3 py-2 text-sm ${
                        m.role === 'user'
                          ? 'bg-[#F97316] text-white'
                          : 'border border-slate-200 bg-white text-slate-800 shadow-sm'
                      }`}
                    >
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 border-t border-slate-200 bg-white p-3">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                  placeholder="Type a message…"
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-[#003049] focus:outline-none focus:ring-2 focus:ring-[#003049]/20"
                />
                <button
                  type="button"
                  onClick={send}
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#003049] text-white hover:bg-[#004d6d]"
                  aria-label="Send"
                >
                  <FiSend className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex max-w-[calc(100vw-2rem)] items-end justify-end gap-2 sm:items-center">
          {!open && (
            <motion.span
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              className="max-w-[min(240px,calc(100vw-5.5rem))] rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 text-left text-xs leading-snug text-slate-700 shadow-md sm:text-sm"
            >
              {WELCOME_MESSAGE}
            </motion.span>
          )}
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full shadow-xl ring-2 ring-white/50 transition hover:scale-[1.03] md:h-16 md:w-16"
            aria-label={open ? 'Close chat' : 'Open chat'}
          >
            <Image
              src={BOT_AVATAR_URL}
              alt="Chat"
              width={64}
              height={64}
              className="object-cover"
              unoptimized
            />
          </button>
        </div>
      </div>
    </>
  );
}
