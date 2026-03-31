declare global {
  interface Window {
    google?: any;
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-script';

const loadGoogleScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Google auth is only available in browser.'));
      return;
    }

    if (window.google?.accounts?.id) {
      resolve();
      return;
    }

    const existing = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google script.')));
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google script.'));
    document.head.appendChild(script);
  });

const parseJwtPayload = (token: string): any => {
  const payload = token.split('.')[1];
  if (!payload) return {};
  const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  return JSON.parse(decoded);
};

export interface GoogleProfilePayload {
  email: string;
  name: string;
  id: string;
}

export const promptGoogleCredential = async (): Promise<GoogleProfilePayload> => {
  await loadGoogleScript();

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

  if (!clientId) {
    throw new Error('Google client ID is missing.');
  }

  return new Promise((resolve, reject) => {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (!response.credential) {
          reject(new Error('Google did not return credential.'));
          return;
        }
        const payload = parseJwtPayload(response.credential);
        resolve({
          email: payload.email || '',
          name: payload.name || '',
          id: payload.sub || '',
        });
      },
      ux_mode: 'popup',
      auto_select: false,
    });

    window.google.accounts.id.prompt((notification: any) => {
      if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
        // Open one-tap disabled/blocked cases via fallback native button
        window.google.accounts.id.renderButton(document.createElement('div'), { theme: 'outline' });
      }
    });
  });
};
