'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from '@/src/context/AuthContext';
import { getStoredToken } from '@/src/utils/storage';
import {
  getChatHubUrl,
  HUB_DELIVERED_EVENTS,
  HUB_RECEIVE_EVENTS,
  HUB_SEEN_EVENTS,
  HUB_SEND_METHODS,
} from '@/src/config/chatHub';
import {
  deleteConversation,
  deleteMessage,
  getMessages,
  getMyConversations,
  markMessagesAsSeen,
  sendChatMessageRest,
  type ChatMessage,
} from '@/src/api/services/chatSystemApi';
import { useChatStore } from '@/src/stores/chatStore';
import { ROUTES } from '@/src/utils/constants';

function normalizeIncomingMessage(raw: unknown, fallbackCid?: string): ChatMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = String(r.id ?? r.Id ?? '');
  const conversationId = String(r.conversationId ?? r.ConversationId ?? fallbackCid ?? '');
  if (!id || !conversationId) return null;
  const senderId = Number(r.senderId ?? r.SenderId ?? 0);
  const receiverId = Number(r.receiverId ?? r.ReceiverId ?? 0);
  const text = String(r.text ?? r.Text ?? '');
  const messageType = Number(r.messageType ?? r.MessageType ?? 0);
  const sentAt = String(r.sentAt ?? r.SentAt ?? new Date().toISOString());
  return {
    id,
    conversationId,
    senderId,
    receiverId,
    text,
    messageType,
    sentAt,
    deliveredAt: (r.deliveredAt ?? r.DeliveredAt ?? null) as string | null,
    seenAt: (r.seenAt ?? r.SeenAt ?? null) as string | null,
    isDelivered: Boolean(r.isDelivered ?? r.IsDelivered),
    isSeen: Boolean(r.isSeen ?? r.IsSeen),
  };
}

type ChatContextValue = {
  hubState: signalR.HubConnectionState | 'Disabled';
  refreshConversations: () => Promise<void>;
  selectConversation: (id: string | null) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  sendText: (conversationId: string, text: string, messageType?: number) => Promise<boolean>;
  sendTyping: (conversationId: string, typing: boolean) => void;
  deleteConv: (conversationId: string) => Promise<boolean>;
  deleteMsg: (conversationId: string, messageId: string) => Promise<boolean>;
  markSeen: (conversationId: string) => Promise<void>;
  openChatUrl: (conversationId: string) => string;
  unreadTotal: number;
};

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const userId = user?.userId;
  const connRef = useRef<signalR.HubConnection | null>(null);
  const [hubState, setHubState] = useState<signalR.HubConnectionState | 'Disabled'>('Disabled');
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setConversations = useChatStore((s) => s.setConversations);
  const setActiveConversationId = useChatStore((s) => s.setActiveConversationId);
  const upsertMessage = useChatStore((s) => s.upsertMessage);
  const patchMessage = useChatStore((s) => s.patchMessage);
  const setMessagesForConversation = useChatStore((s) => s.setMessagesForConversation);
  const updateConversationMeta = useChatStore((s) => s.updateConversationMeta);
  const activeConversationId = useChatStore((s) => s.activeConversationId);
  const unreadTotal = useChatStore((s) => s.unreadTotal);

  const scheduleRefresh = useCallback(() => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    refreshTimer.current = setTimeout(async () => {
      if (!userId) return;
      const list = await getMyConversations(userId);
      setConversations(list);
    }, 400);
  }, [userId, setConversations]);

  const refreshConversations = useCallback(async () => {
    if (!userId) return;
    const list = await getMyConversations(userId);
    setConversations(list);
  }, [userId, setConversations]);

  useEffect(() => {
    if (authLoading || !isAuthenticated || !userId) {
      setHubState('Disabled');
      if (connRef.current) {
        connRef.current.stop().catch(() => {});
        connRef.current = null;
      }
      return;
    }

    const url = getChatHubUrl();
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(url, {
        accessTokenFactory: () => getStoredToken('access') || '',
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000])
      .build();

    connRef.current = connection;

    const onMsg = (payload: unknown) => {
      const msg = normalizeIncomingMessage(payload);
      if (!msg) return;
      upsertMessage(msg.conversationId, msg);
      scheduleRefresh();
    };

    for (const ev of HUB_RECEIVE_EVENTS) {
      connection.on(ev, onMsg);
    }

    const onDelivered = (payload: unknown) => {
      const p = payload as Record<string, unknown>;
      const mid = String(p?.messageId ?? p?.MessageId ?? p?.id ?? '');
      const cid = String(p?.conversationId ?? p?.ConversationId ?? '');
      if (mid && cid) {
        patchMessage(cid, mid, { isDelivered: true, deliveredAt: new Date().toISOString() });
      }
    };
    for (const ev of HUB_DELIVERED_EVENTS) {
      connection.on(ev, onDelivered);
    }

    const onSeen = (payload: unknown) => {
      const p = payload as Record<string, unknown>;
      const mid = String(p?.messageId ?? p?.MessageId ?? p?.id ?? '');
      const cid = String(p?.conversationId ?? p?.ConversationId ?? '');
      if (mid && cid) {
        patchMessage(cid, mid, { isSeen: true, seenAt: new Date().toISOString() });
      }
    };
    for (const ev of HUB_SEEN_EVENTS) {
      connection.on(ev, onSeen);
    }

    connection.onreconnecting(() => setHubState(connection.state));
    connection.onreconnected(() => {
      setHubState(connection.state);
      refreshConversations();
    });
    connection.onclose(() => setHubState(connection.state));

    connection
      .start()
      .then(() => {
        setHubState(connection.state);
        return connection.invoke('JoinUser', userId).catch(() =>
          connection.invoke('joinUser', userId).catch(() => {}),
        );
      })
      .catch(() => {
        setHubState('Disabled');
      });

    refreshConversations();

    return () => {
      connection.stop().catch(() => {});
      connRef.current = null;
    };
  }, [
    authLoading,
    isAuthenticated,
    userId,
    upsertMessage,
    patchMessage,
    scheduleRefresh,
    refreshConversations,
  ]);

  useEffect(() => {
    const onFocus = () => {
      if (isAuthenticated && userId) refreshConversations();
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [isAuthenticated, userId, refreshConversations]);

  const selectConversation = useCallback(
    async (id: string | null) => {
      setActiveConversationId(id);
      if (!id || !userId) return;
      const res = await getMessages(id, userId, undefined, 30);
      setMessagesForConversation(id, res.items, res.hasMore, res.nextCursor);
      connRef.current?.invoke('JoinConversation', id).catch(() => {});
      const last = res.items.length
        ? res.items.reduce((a, b) => (new Date(a.sentAt) > new Date(b.sentAt) ? a : b))
        : null;
      if (last) {
        await markMessagesAsSeen(userId, id, last.id);
        updateConversationMeta(id, { unseenCount: 0 });
      }
    },
    [userId, setActiveConversationId, setMessagesForConversation, updateConversationMeta],
  );

  const loadOlderMessages = useCallback(
    async (conversationId: string) => {
      if (!userId) return;
      const st = useChatStore.getState();
      let cursor = st.messageCursor[conversationId];
      const hasMore = st.messageHasMore[conversationId];
      if (!hasMore) return;
      if (!cursor) {
        const msgs = st.messagesByConversation[conversationId] || [];
        if (msgs.length === 0) return;
        const oldest = msgs.reduce((a, b) =>
          new Date(a.sentAt) < new Date(b.sentAt) ? a : b,
        );
        cursor = oldest.id;
      }
      const res = await getMessages(conversationId, userId, cursor, 30);
      st.prependOlderMessages(conversationId, res.items, res.hasMore, res.nextCursor);
    },
    [userId],
  );

  const sendText = useCallback(
    async (conversationId: string, text: string, messageType = 0) => {
      if (!userId || !text.trim()) return false;
      const trimmed = text.trim();
      const optimistic: ChatMessage = {
        id: `temp-${Date.now()}`,
        conversationId,
        senderId: userId,
        receiverId: 0,
        text: trimmed,
        messageType,
        sentAt: new Date().toISOString(),
        deliveredAt: null,
        seenAt: null,
        isDelivered: false,
        isSeen: false,
      };
      upsertMessage(conversationId, optimistic);

      const conn = connRef.current;
      if (conn && conn.state === signalR.HubConnectionState.Connected) {
        for (const method of HUB_SEND_METHODS) {
          try {
            await conn.invoke(method, conversationId, trimmed, messageType);
            scheduleRefresh();
            return true;
          } catch {
            /* try next */
          }
        }
      }

      const convs = useChatStore.getState().conversations;
      const c = convs.find((x) => x.id === conversationId);
      const receiverId =
        c != null ? (c.buyerId === userId ? c.sellerId : c.buyerId) : undefined;

      const saved = await sendChatMessageRest(userId, {
        conversationId,
        text: trimmed,
        messageType,
        receiverId,
      });
      if (saved) {
        useChatStore.getState().removeMessage(conversationId, optimistic.id);
        upsertMessage(conversationId, saved);
        scheduleRefresh();
        return true;
      }
      useChatStore.getState().removeMessage(conversationId, optimistic.id);
      return false;
    },
    [userId, upsertMessage, scheduleRefresh],
  );

  const sendTyping = useCallback((conversationId: string, typing: boolean) => {
    const conn = connRef.current;
    if (!conn || conn.state !== signalR.HubConnectionState.Connected) return;
    conn.invoke('Typing', conversationId, typing).catch(() => {});
  }, []);

  const deleteConv = useCallback(
    async (conversationId: string) => {
      const res = await deleteConversation(conversationId);
      if (res.success) {
        useChatStore.getState().removeConversation(conversationId);
      }
      return res.success;
    },
    [],
  );

  const deleteMsg = useCallback(async (conversationId: string, messageId: string) => {
    const res = await deleteMessage(messageId);
    if (res.returnCode) {
      useChatStore.getState().removeMessage(conversationId, messageId);
    }
    return res.returnCode;
  }, []);

  const markSeen = useCallback(
    async (conversationId: string) => {
      if (!userId) return;
      const msgs = useChatStore.getState().messagesByConversation[conversationId] || [];
      const last = msgs.length
        ? msgs.reduce((a, b) => (new Date(a.sentAt) > new Date(b.sentAt) ? a : b))
        : null;
      if (last) {
        await markMessagesAsSeen(userId, conversationId, last.id);
        updateConversationMeta(conversationId, { unseenCount: 0 });
      }
    },
    [userId, updateConversationMeta],
  );

  const openChatUrl = useCallback((conversationId: string) => {
    return `${ROUTES.CHAT}?c=${encodeURIComponent(conversationId)}`;
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({
      hubState,
      refreshConversations,
      selectConversation,
      loadOlderMessages,
      sendText,
      sendTyping,
      deleteConv,
      deleteMsg,
      markSeen,
      openChatUrl,
      unreadTotal,
    }),
    [
      hubState,
      refreshConversations,
      selectConversation,
      loadOlderMessages,
      sendText,
      sendTyping,
      deleteConv,
      deleteMsg,
      markSeen,
      openChatUrl,
      unreadTotal,
    ],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return ctx;
}

export function useChatOptional(): ChatContextValue | null {
  return useContext(ChatContext);
}
