import { create } from 'zustand';
import type { ChatMessage, Conversation } from '@/src/api/services/chatSystemApi';

export type ChatFilter = 'product' | 'buyer';

function sortMessages(a: ChatMessage, b: ChatMessage): number {
  return new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime();
}

export function totalUnread(list: Conversation[], activeId: string | null): number {
  return list.reduce((s, c) => {
    if (activeId && c.id === activeId) return s;
    return s + (c.unseenCount > 0 ? c.unseenCount : 0);
  }, 0);
}

interface ChatStoreState {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  messageCursor: Record<string, string | null>;
  messageHasMore: Record<string, boolean>;
  activeConversationId: string | null;
  filter: ChatFilter;
  typingByConversation: Record<string, boolean>;
  unreadTotal: number;

  setFilter: (f: ChatFilter) => void;
  setConversations: (list: Conversation[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setMessagesForConversation: (
    cid: string,
    items: ChatMessage[],
    hasMore: boolean,
    cursor: string | null,
  ) => void;
  prependOlderMessages: (
    cid: string,
    older: ChatMessage[],
    hasMore: boolean,
    cursor: string | null,
  ) => void;
  upsertMessage: (cid: string, msg: ChatMessage, myUserId?: number) => void;
  patchMessage: (cid: string, messageId: string, patch: Partial<ChatMessage>) => void;
  removeMessage: (cid: string, messageId: string) => void;
  removeConversation: (cid: string) => void;
  updateConversationMeta: (cid: string, patch: Partial<Conversation>) => void;
  clearTyping: (cid: string) => void;
  setTyping: (cid: string, on: boolean) => void;
}

export const useChatStore = create<ChatStoreState>((set, get) => ({
  conversations: [],
  messagesByConversation: {},
  messageCursor: {},
  messageHasMore: {},
  activeConversationId: null,
  filter: 'product',
  typingByConversation: {},
  unreadTotal: 0,

  setFilter: (f) => set({ filter: f }),

  setConversations: (list) =>
    set({
      conversations: list,
      unreadTotal: totalUnread(list, get().activeConversationId),
    }),

  setActiveConversationId: (id) =>
    set((s) => ({
      activeConversationId: id,
      unreadTotal: totalUnread(s.conversations, id),
    })),

  setMessagesForConversation: (cid, items, hasMore, cursor) =>
    set((s) => {
      const merged = [...items].sort(sortMessages);
      return {
        messagesByConversation: { ...s.messagesByConversation, [cid]: merged },
        messageHasMore: { ...s.messageHasMore, [cid]: hasMore },
        messageCursor: { ...s.messageCursor, [cid]: cursor },
      };
    }),

  prependOlderMessages: (cid, older, hasMore, cursor) =>
    set((s) => {
      const existing = s.messagesByConversation[cid] || [];
      const byId = new Map<string, ChatMessage>();
      older.forEach((m) => byId.set(m.id, m));
      existing.forEach((m) => byId.set(m.id, m));
      const merged = [...byId.values()].sort(sortMessages);
      return {
        messagesByConversation: { ...s.messagesByConversation, [cid]: merged },
        messageHasMore: { ...s.messageHasMore, [cid]: hasMore },
        messageCursor: { ...s.messageCursor, [cid]: cursor },
      };
    }),

  upsertMessage: (cid, msg, myUserId) =>
    set((s) => {
      const list = s.messagesByConversation[cid] || [];
      const idx = list.findIndex((m) => m.id === msg.id);
      const isNew = idx < 0;
      let next: ChatMessage[];
      if (idx >= 0) {
        next = [...list];
        next[idx] = { ...next[idx], ...msg };
      } else {
        next = [...list, msg].sort(sortMessages);
      }

      const incoming =
        myUserId != null && myUserId > 0 && msg.senderId !== myUserId && isNew;
      const viewing = s.activeConversationId === cid;

      const convs = s.conversations.map((c) => {
        if (c.id !== cid) return c;
        let unseen = c.unseenCount ?? 0;
        if (incoming) {
          unseen = viewing ? 0 : unseen + 1;
        }
        return {
          ...c,
          lastMessageText: msg.text,
          lastMessageAt: msg.sentAt,
          unseenCount: unseen,
        };
      });

      return {
        messagesByConversation: { ...s.messagesByConversation, [cid]: next },
        conversations: convs,
        unreadTotal: totalUnread(convs, s.activeConversationId),
      };
    }),

  patchMessage: (cid, messageId, patch) =>
    set((s) => {
      const list = s.messagesByConversation[cid] || [];
      const next = list.map((m) => (m.id === messageId ? { ...m, ...patch } : m));
      return {
        messagesByConversation: { ...s.messagesByConversation, [cid]: next },
      };
    }),

  removeMessage: (cid, messageId) =>
    set((s) => {
      const list = s.messagesByConversation[cid] || [];
      return {
        messagesByConversation: {
          ...s.messagesByConversation,
          [cid]: list.filter((m) => m.id !== messageId),
        },
      };
    }),

  removeConversation: (cid) =>
    set((s) => {
      const convs = s.conversations.filter((c) => c.id !== cid);
      const { [cid]: _m, ...restMsg } = s.messagesByConversation;
      const { [cid]: _c, ...restCursor } = s.messageCursor;
      const { [cid]: _h, ...restHas } = s.messageHasMore;
      const { [cid]: _t, ...restTyping } = s.typingByConversation;
      const nextActive = s.activeConversationId === cid ? null : s.activeConversationId;
      return {
        conversations: convs,
        messagesByConversation: restMsg,
        messageCursor: restCursor,
        messageHasMore: restHas,
        typingByConversation: restTyping,
        activeConversationId: nextActive,
        unreadTotal: totalUnread(convs, nextActive),
      };
    }),

  updateConversationMeta: (cid, patch) =>
    set((s) => {
      const convs = s.conversations.map((c) => (c.id === cid ? { ...c, ...patch } : c));
      return {
        conversations: convs,
        unreadTotal: totalUnread(convs, s.activeConversationId),
      };
    }),

  clearTyping: (cid) =>
    set((s) => {
      const { [cid]: _, ...rest } = s.typingByConversation;
      return { typingByConversation: rest };
    }),

  setTyping: (cid, on) =>
    set((s) => ({
      typingByConversation: on
        ? { ...s.typingByConversation, [cid]: true }
        : Object.fromEntries(Object.entries(s.typingByConversation).filter(([k]) => k !== cid)),
    })),
}));
