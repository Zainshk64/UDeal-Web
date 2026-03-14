import apiClient from './api';
import { getUserData } from '@/src/utils/storage';

const sessionProductSet = new Set<number>();

/**
 * Track product view after 15 seconds
 */
export const addProductToUserSession = async (
  productId: number
): Promise<void> => {
  if (!productId) return;

  sessionProductSet.add(productId);

  try {
    const userData = getUserData();
    if (!userData?.userId) {
      console.log('UserSession skipped (no user)');
      return;
    }

    const payload = {
      userId: userData.userId,
      fcmToken: 'web-session',
      productId: Array.from(sessionProductSet),
    };

    await apiClient.post('/UserSession', payload);
    console.log('UserSession API success');
  } catch (err: any) {
    console.log(
      'UserSession error:',
      err?.response?.data || err.message
    );
  }
};