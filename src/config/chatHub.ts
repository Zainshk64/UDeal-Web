const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api-v2.udealzone.com/api';

export function getChatHubUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL?.trim();
  if (explicit) return explicit;
  try {
    const u = new URL(API_BASE);
    return `${u.origin}/chathub`;
  } catch {
    return 'https://api-v2.udealzone.com/chathub';
  }
}

export const HUB_SEND_METHODS = ['SendMessage', 'sendMessage', 'SendTextMessage'] as const;

export const HUB_RECEIVE_EVENTS = [
  'ReceiveMessage',
  'receiveMessage',
  'OnMessageReceived',
  'NewMessage',
] as const;

export const HUB_DELIVERED_EVENTS = ['MessageDelivered', 'OnDelivered', 'onDelivered'] as const;
export const HUB_SEEN_EVENTS = ['MessageSeen', 'OnSeen', 'onSeen'] as const;
