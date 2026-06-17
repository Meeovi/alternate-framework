export type RoomType = 'dm' | 'group' | 'channel' | 'support' | 'system';

export interface Room {
  id: string;
  type: RoomType;
  slug?: string;
  title?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  isPrivate: boolean;
  isReadOnly: boolean;
  metadata?: Record<string, unknown>;
}
