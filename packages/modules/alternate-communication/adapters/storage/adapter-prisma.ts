import { PrismaClient } from '@prisma/client';
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

export interface PrismaStorageAdapterOptions {
  prisma: PrismaClient;
}

export function createPrismaStorageAdapter(
  options: PrismaStorageAdapterOptions
): CommunicationStorageAdapter {
  const prisma = options.prisma;

  return {
    // Rooms
    async createRoom(room: Room): Promise<Room> {
      return prisma.room.create({ data: room });
    },

    async updateRoom(roomId: string, patch: Partial<Room>): Promise<Room> {
      return prisma.room.update({
        where: { id: roomId },
        data: patch
      });
    },

    async getRoomById(roomId: string): Promise<Room | null> {
      return prisma.room.findUnique({ where: { id: roomId } });
    },

    async getRoomsForUser(userId: string, opts?: ListRoomsOptions): Promise<ListRoomsResult> {
      const limit = opts?.limit ?? 50;

      const rooms = await prisma.roomMember.findMany({
        where: { userId },
        take: limit,
        skip: opts?.cursor ? 1 : 0,
        cursor: opts?.cursor ? { roomId_userId: { roomId: opts.cursor, userId } } : undefined,
        include: { room: true }
      });

      return {
        items: rooms.map((r: { room: Room }) => r.room),
        nextCursor: rooms.length === limit ? rooms[rooms.length - 1].roomId : undefined
      };
    },

    // Members
    async addMember(member: RoomMember): Promise<RoomMember> {
      return prisma.roomMember.create({ data: member });
    },

    async updateMember(roomId: string, userId: string, patch: Partial<RoomMember>): Promise<RoomMember> {
      return prisma.roomMember.update({
        where: { roomId_userId: { roomId, userId } },
        data: patch
      });
    },

    async removeMember(roomId: string, userId: string): Promise<void> {
      await prisma.roomMember.delete({
        where: { roomId_userId: { roomId, userId } }
      });
    },

    async listMembers(roomId: string): Promise<RoomMember[]> {
      return prisma.roomMember.findMany({ where: { roomId } });
    },

    // Messages
    async createMessage(message: Message): Promise<Message> {
      return prisma.message.create({ data: message });
    },

    async updateMessage(messageId: string, patch: Partial<Message>): Promise<Message> {
      return prisma.message.update({
        where: { id: messageId },
        data: patch
      });
    },

    async softDeleteMessage(messageId: string): Promise<void> {
      await prisma.message.update({
        where: { id: messageId },
        data: { deletedAt: new Date().toISOString() }
      });
    },

    async hardDeleteMessage(messageId: string): Promise<void> {
      await prisma.message.delete({ where: { id: messageId } });
    },

    async getMessageById(messageId: string): Promise<Message | null> {
      return prisma.message.findUnique({ where: { id: messageId } });
    },

    async listMessages(roomId: string, opts?: ListMessagesOptions): Promise<Message[]> {
      return prisma.message.findMany({
        where: {
          roomId,
          ...(opts?.threadParentId ? { parentId: opts.threadParentId } : {})
        },
        orderBy: { createdAt: 'desc' },
        take: opts?.limit ?? 50,
        ...(opts?.before ? { cursor: { id: opts.before }, skip: 1 } : {})
      });
    },

    // Reactions
    async addReaction(reaction: Reaction): Promise<Reaction> {
      return prisma.reaction.create({ data: reaction });
    },

    async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
      await prisma.reaction.delete({
        where: { messageId_userId_emoji: { messageId, userId, emoji } }
      });
    },

    async listReactions(messageId: string): Promise<Reaction[]> {
      return prisma.reaction.findMany({ where: { messageId } });
    }
  };
}
