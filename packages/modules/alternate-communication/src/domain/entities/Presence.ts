export type PresenceStatus = 'online' | 'offline' | 'away' | 'busy';

export interface Presence {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: string;
}
