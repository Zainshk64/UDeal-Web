import apiClient from './api';

// ============================================
// TYPES
// ============================================

export interface Notification {
  notid: number;
  title: string;
  description: string;
  entryDate: string;
}

// ============================================
// GET NOTIFICATIONS
// ============================================

export const getNotifications = async (
  userId: number
): Promise<Notification[]> => {
  try {
    const response = await apiClient.get<Notification[]>(
      '/Default/notifications',
      {
        params: { Uid: userId },
      }
    );
    return response.data || [];
  } catch (error: any) {
    console.error('Notification API error:', error.message);
    return [];
  }
};