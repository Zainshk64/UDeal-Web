import apiClient from './api';
import { getImageUrl } from '@/src/utils/image';

export interface Conversation {
  id: string;
  productId: number;
  buyerId: number;
  sellerId: number;
  lastMessageText: string | null;
  lastMessageAt: string | null;
  unseenCount: number;
  type?: number;
  label?: string;
  productTitle?: string;
  productImageUrl?: string;
  sellerName?: string;
  sellerImageUrl?: string;
  buyerName?: string;
  buyerImageUrl?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: number;
  receiverId: number;
  text: string;
  messageType: number;
  sentAt: string;
  deliveredAt: string | null;
  seenAt: string | null;
  isDelivered: boolean;
  isSeen: boolean;
}

export interface MessagesResponse {
  items: ChatMessage[];
  nextCursor: string | null;
  hasMore: boolean;
}

export function getChatImageUrl(path: string | null | undefined): string {
  return getImageUrl(path ?? null);
}

export const createConversation = async (
  productId: number,
  buyerId: number,
): Promise<string | null> => {
  try {
    const response = await apiClient.post<string | { id?: string }>('/chat/conversations', {
      productId,
      buyerId,
    });
    const d = response.data;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object' && d.id) return d.id;
    return null;
  } catch {
    return null;
  }
};

export const createBuyerConversation = async (
  productReqId: number,
  sellerId: number,
): Promise<string | null> => {
  try {
    const response = await apiClient.post<string | { id?: string }>('/chat/conversations/buyer', {
      productReqId,
      sellerId,
    });
    const d = response.data;
    if (typeof d === 'string') return d;
    if (d && typeof d === 'object' && d.id) return d.id;
    return null;
  } catch {
    return null;
  }
};

export const deleteConversation = async (
  conversationId: string,
): Promise<{ success: boolean; message?: string }> => {
  if (!conversationId?.trim()) {
    return { success: false, message: 'Invalid conversation' };
  }
  try {
    const response = await apiClient.delete(
      '/chat/conversations/DeleteConversation?conversationId=' +
        encodeURIComponent(conversationId.trim()),
    );
    const ok = response?.status === 200 || response?.data === true;
    return {
      success: ok,
      message: ok ? 'Conversation deleted' : (response?.data as { message?: string })?.message,
    };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message || err?.message || 'Failed to delete conversation';
    return { success: false, message };
  }
};

export const getMyConversations = async (userId: number): Promise<Conversation[]> => {
  try {
    const response = await apiClient.get<Conversation[]>('/chat/conversations/mine', {
      params: { userId },
    });
    return response.data || [];
  } catch {
    return [];
  }
};

export const getMessages = async (
  conversationId: string,
  userId: number,
  lastMessageId?: string,
  pageSize: number = 30,
): Promise<MessagesResponse> => {
  try {
    const params: Record<string, string | number> = {
      UserId: userId,
      pageSize,
    };
    if (lastMessageId) {
      params.lastMessageId = lastMessageId;
    }
    const response = await apiClient.get<MessagesResponse>('/chat/messages/' + conversationId, {
      params,
    });
    return (
      response.data || {
        items: [],
        nextCursor: null,
        hasMore: false,
      }
    );
  } catch {
    return {
      items: [],
      nextCursor: null,
      hasMore: false,
    };
  }
};

export const markMessagesAsSeen = async (
  userId: number,
  conversationId: string,
  upToMessageId: string,
): Promise<boolean> => {
  try {
    await apiClient.post(
      '/chat/messages/seen',
      {
        conversationId,
        upToMessageId,
      },
      {
        params: { UserId: userId },
      },
    );
    return true;
  } catch {
    return false;
  }
};

export const deleteMessage = async (
  messageId: string,
): Promise<{ returnCode: boolean; returnText: string }> => {
  try {
    const response = await apiClient.delete('/chat/messages/DeleteMessage', {
      params: { Id: messageId },
    });
    return response.data as { returnCode: boolean; returnText: string };
  } catch (error: unknown) {
    const err = error as { response?: { data?: { returnText?: string } } };
    return {
      returnCode: false,
      returnText: err?.response?.data?.returnText || 'Failed to delete message',
    };
  }
};

export const sendChatMessageRest = async (
  userId: number,
  body: {
    conversationId: string;
    text: string;
    messageType?: number;
    receiverId?: number;
  },
): Promise<ChatMessage | null> => {
  try {
    const response = await apiClient.post<ChatMessage>('/chat/messages', body, {
      params: { UserId: userId },
    });
    return response.data ?? null;
  } catch {
    try {
      const response = await apiClient.post<ChatMessage>('/chat/messages/send', body, {
        params: { UserId: userId },
      });
      return response.data ?? null;
    } catch {
      return null;
    }
  }
};
