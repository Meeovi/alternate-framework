export type MessageType = 'default' | 'system' | 'event';

export interface Message {
  id: string;
  roomId: string;
  userId: string;
  type: MessageType;
  body: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
  edited: boolean;
  deletedAt?: string | null;
  metadata?: Record<string, unknown>;
}
