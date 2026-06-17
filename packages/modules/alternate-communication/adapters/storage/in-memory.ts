import {
  CommunicationStorageAdapter,
  ListMessagesOptions,
  ListRoomsOptions,
  ListRoomsResult
} from '../../src/ports/storage';
import { Room } from '../../src/domain/entities/Room';
import { RoomMember } from '../../src/domain/entities/RoomMember';
import { Message } from '../../src/domain/entities/Message';
import { Reaction } from '../../src/domain/entities/Reaction';

export function createInMemoryStorageAdapter(): CommunicationStorageAdapter {
  const rooms = new Map<string, Room>();
  const members = new Map<string, RoomMember>();
  const messages = new Map<string, Message>();
  const reactions = new Map<string, Reaction>();

  const memberKey = (roomId: string, userId: string) => `${roomId}:${userId}`;
  const reactionKey = (m: string, u: string, e: string) => `${m}:${u}:${e}`;

  return {
    async createRoom(room) {
      rooms.set(room.id, room);
      return room;
    },

    async updateRoom(roomId, patch) {
      const existing = rooms.get(roomId);
      if (!existing) throw new Error('Room not found');
      const updated = { ...existing, ...patch };
      rooms.set(roomId, updated);
      return updated;
    },

    async getRoomById(roomId) {
      return rooms.get(roomId) ?? null;
    },

    async getRoomsForUser(userId, opts) {
      const limit = opts?.limit ?? 50;

      const userRooms = [...members.values()]
        .filter(m => m.userId === userId)
        .map(m => rooms.get(m.roomId)!)
        .slice(0, limit);

      return {
        items: userRooms,
        nextCursor: undefined
      };
    },

    async addMember(member) {
      members.set(memberKey(member.roomId, member.userId), member);
      return member;
    },

    async updateMember(roomId, userId, patch) {
      const key = memberKey(roomId, userId);
      const existing = members.get(key);
      if (!existing) throw new Error('Member not found');
      const updated = { ...existing, ...patch };
      members.set(key, updated);
      return updated;
    },

    async removeMember(roomId, userId) {
      members.delete(memberKey(roomId, userId));
    },

    async listMembers(roomId) {
      return [...members.values()].filter(m => m.roomId === roomId);
    },

    async createMessage(message) {
      messages.set(message.id, message);
      return message;
    },

    async updateMessage(messageId, patch) {
      const existing = messages.get(messageId);
      if (!existing) throw new Error('Message not found');
      const updated = { ...existing, ...patch };
      messages.set(messageId, updated);
      return updated;
    },

    async softDeleteMessage(messageId) {
      const existing = messages.get(messageId);
      if (!existing) return;
      existing.deletedAt = new Date().toISOString();
      messages.set(messageId, existing);
    },

    async hardDeleteMessage(messageId) {
      messages.delete(messageId);
    },

    async getMessageById(messageId) {
      return messages.get(messageId) ?? null;
    },

    async listMessages(roomId, opts) {
      return [...messages.values()]
        .filter(m => m.roomId === roomId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, opts?.limit ?? 50);
    },

    async addReaction(reaction) {
      reactions.set(reactionKey(reaction.messageId, reaction.userId, reaction.emoji), reaction);
      return reaction;
    },

    async removeReaction(messageId, userId, emoji) {
      reactions.delete(reactionKey(messageId, userId, emoji));
    },

    async listReactions(messageId) {
      return [...reactions.values()].filter(r => r.messageId === messageId);
    }
  };
}
