import { Room } from '../domain/entities/Room';
import { RoomMember } from '../domain/entities/RoomMember';
import { Message } from '../domain/entities/Message';
import { Reaction } from '../domain/entities/Reaction';

export interface ListRoomsOptions {
  limit?: number;
  cursor?: string;
}

export interface ListRoomsResult {
  items: Room[];
  nextCursor?: string;
}

export interface ListMessagesOptions {
  limit?: number;
  before?: string;
  after?: string;
  threadParentId?: string;
}

export interface CommunicationStorageAdapter {
  createRoom(room: Room): Promise<Room>;
  updateRoom(roomId: string, patch: Partial<Room>): Promise<Room>;
  getRoomById(roomId: string): Promise<Room | null>;
  getRoomsForUser(userId: string, opts?: ListRoomsOptions): Promise<ListRoomsResult>;

  addMember(member: RoomMember): Promise<RoomMember>;
  updateMember(roomId: string, userId: string, patch: Partial<RoomMember>): Promise<RoomMember>;
  removeMember(roomId: string, userId: string): Promise<void>;
  listMembers(roomId: string): Promise<RoomMember[]>;

  createMessage(message: Message): Promise<Message>;
  updateMessage(messageId: string, patch: Partial<Message>): Promise<Message>;
  softDeleteMessage(messageId: string, deletedBy: string): Promise<void>;
  hardDeleteMessage(messageId: string): Promise<void>;
  getMessageById(messageId: string): Promise<Message | null>;
  listMessages(roomId: string, opts?: ListMessagesOptions): Promise<Message[]>;

  addReaction(reaction: Reaction): Promise<Reaction>;
  removeReaction(messageId: string, userId: string, emoji: string): Promise<void>;
  listReactions(messageId: string): Promise<Reaction[]>;
}
