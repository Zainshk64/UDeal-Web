// src/api/services/paymentApi.ts
import { getStoredToken } from '@/src/utils/storage';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-v2.udealzone.com/api';

interface PaymentResponse {
  message: string;
  statusCode: string;
  isError: boolean;
  data: any | null;
}

interface AlfalahAuthTokenResponse {
  orderId: string;
  authToken: string;
}

interface AlfalahIpnResponse {
  responseCode: boolean;
  responseText: string;
}

interface BankSubscriptionResponse {
  returnCode: boolean;
  returnText: string;
  orderId?: string;
  subscriptionId?: number;
}

// ═══════════════════════════════════════════════════════════
// EasyPaisa Payment
// ═══════════════════════════════════════════════════════════

export const initiateEasyPaisa = async (
  mobileNumber: string,
  adPlanId: number,
  memberId: number
): Promise<PaymentResponse> => {
  try {
    const orderId = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const payload = {
      orderId,
      mobileAccountNo: mobileNumber,
      memberId,
      adPlanId,
    };

    const response = await fetch(`${API_BASE}/Payment/EasyPaisa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredToken('access')}`,
      },
      body: JSON.stringify(payload),
    });

    const result: PaymentResponse = await response.json();
    return result;
  } catch (error: any) {
    return {
      message: error.message || 'Network error',
      statusCode: '500',
      isError: true,
      data: null,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// JazzCash Payment
// ═══════════════════════════════════════════════════════════

export const initiateJazzCash = async (
  mobileNumber: string,
  cnic: string,
  adPlanId: number,
  memberId: number
): Promise<PaymentResponse> => {
  try {
    const payload = { mobileNumber, cnic, adPlanId, memberId };

    const response = await fetch(`${API_BASE}/Payment/JazzCash`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredToken('access')}`,
      },
      body: JSON.stringify(payload),
    });

    const result: PaymentResponse = await response.json();
    return result;
  } catch (error: any) {
    return {
      message: error.message || 'Network error',
      statusCode: '500',
      isError: true,
      data: null,
    };
  }
};

// ═══════════════════════════════════════════════════════════
// Bank Alfalah Card Payment
// ═══════════════════════════════════════════════════════════

export const generateAlfalahAuthToken = async (
  amount: number
): Promise<AlfalahAuthTokenResponse> => {
  try {
    const response = await fetch(
      `${API_BASE}/Payment/BankAlfalahSandboxAuthToken?amount=${encodeURIComponent(amount)}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredToken('access')}`,
        },
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate token');
    }

    const data: AlfalahAuthTokenResponse = await response.json();

    if (!data.orderId || !data.authToken) {
      throw new Error('Invalid auth token response');
    }

    return data;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to generate payment token');
  }
};

export const getAlfalahSsoHtml = async (
  orderId: string,
  authToken: string
): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/Payment/sso`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getStoredToken('access')}`,
        Accept: 'text/html,application/json',
      },
      body: JSON.stringify({ orderId, authToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to load payment page');
    }

    const html = await response.text();

    if (!html || html.length < 50) {
      throw new Error('Empty or invalid SSO response');
    }

    return html;
  } catch (error: any) {
    throw new Error(error.message || 'Failed to load checkout');
  }
};

export const callAlfalahIpnListener = async (
  orderId: string,
  maxAttempts: number = 3,
  delayMs: number = 5000
): Promise<AlfalahIpnResponse> => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(
        `${API_BASE}/Payment/alfalah-ipn-listener?orderId=${encodeURIComponent(orderId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getStoredToken('access')}`,
          },
        }
      );

      const data: AlfalahIpnResponse = await response.json();

      if (data.responseCode === true) {
        return data;
      }

      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    } catch (error: any) {
      if (attempt < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  return {
    responseCode: false,
    responseText: 'IPN verification failed after all retries',
  };
};

export const activateBankSubscription = async (
  orderId: string,
  adPlanId: number
): Promise<BankSubscriptionResponse> => {
  try {
    const response = await fetch(
      `${API_BASE}/Payment/bank-subscription?orderId=${encodeURIComponent(orderId)}&AdPlanId=${adPlanId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getStoredToken('access')}`,
        },
      }
    );

    const data: BankSubscriptionResponse = await response.json();
    return data;
  } catch (error: any) {
    return {
      returnCode: false,
      returnText: error.message || 'Subscription activation failed',
    };
  }
};