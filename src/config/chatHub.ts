export function getChatHubUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SIGNALR_HUB_URL?.trim();
  if (explicit) return explicit;
  return 'https://api-v2.udealzone.com/hubs/chat';
}

export const HUB_SEND_METHODS = ['SendMessage'] as const;

export const HUB_RECEIVE_EVENTS = [
  'ReceiveMessage',
] as const;

export const HUB_DELIVERED_EVENTS = ['MessageDelivered'] as const;
export const HUB_SEEN_EVENTS = ['MessagesSeen'] as const;
export const HUB_TYPING_EVENTS = ['UserTyping'] as const;
export const HUB_STOP_TYPING_EVENTS = ['UserStoppedTyping'] as const;
export const HUB_ONLINE_EVENTS = ['UserOnline'] as const;
export const HUB_OFFLINE_EVENTS = ['UserOffline'] as const;
