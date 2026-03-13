import apiClient from './api';

// ============================================
// TYPES
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
}

export interface ChatbotResponse {
  reply: string;
  blocked?: boolean;
  blockReason?: string | null;
}
// ============================================
// SEND CHAT MESSAGE
// ============================================

export const sendChatMessage = async (
  message: string,
  conversationId: string
): Promise<ChatbotResponse | null> => {
  try {
    const response = await apiClient.post<ChatbotResponse>('/udeal-ai/chat', {
      message,
      conversationId,
    });

    return response.data;
  } catch (error: any) {
    console.error('Chatbot API error:', error);
    return null;
  }
};

// ============================================
// GET INITIAL GREETING
// ============================================

export const getInitialGreeting = async (
  conversationId: string
): Promise<ChatbotResponse | null> => {
  try {
    const response = await apiClient.post<ChatbotResponse>('/udeal-ai/chat', {
      message: 'Hello',
      conversationId,
    });

    return response.data;
  } catch (error: any) {
    console.error('Get greeting error:', error);
    return null;
  }
};
