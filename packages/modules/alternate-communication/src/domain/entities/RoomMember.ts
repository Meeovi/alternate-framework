export type RoomRole = 'owner' | 'admin' | 'member' | 'guest' | 'bot';

export interface RoomMember {
  roomId: string;
  userId: string;
  role: RoomRole;
  joinedAt: string;
  mutedUntil?: string | null;
}
