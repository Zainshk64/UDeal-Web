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
    console.log('Sending message:', { message, conversationId }); // Debug log
    
    const response = await apiClient.post<ChatbotResponse>('/udeal-ai/chat', {
      message,
      conversationId,
    });

    console.log('Chat response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Chatbot API error:', error.response?.data || error.message);
    return null;
  }
};

// ============================================
// GET INITIAL GREETING (NO MESSAGE REQUIRED)
// ============================================

export const getInitialGreeting = async (
  conversationId: string
): Promise<ChatbotResponse | null> => {
  try {
    console.log('Getting initial greeting with conversationId:', conversationId); // Debug log
    
    // Send empty message to get initial greeting as per API spec
    const response = await apiClient.post<ChatbotResponse>('/udeal-ai/chat', {
      message: '',
      conversationId,
    });

    console.log('Initial greeting response:', response.data); // Debug log
    return response.data;
  } catch (error: any) {
    console.error('Get greeting error:', error.response?.data || error.message);
    return null;
  }
};