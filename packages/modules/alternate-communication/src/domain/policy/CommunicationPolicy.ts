import { Room, RoomType } from '../entities/Room';
import { Message } from '../entities/Message';

export interface CommunicationPolicyContext {
  userId: string;
  roles: string[];
}

export interface CommunicationPolicy {
  canCreateRoom(ctx: CommunicationPolicyContext, input: { type: RoomType }): boolean;
  canSendMessage(ctx: CommunicationPolicyContext, room: Room): boolean;
  canEditMessage(ctx: CommunicationPolicyContext, message: Message): boolean;
  canDeleteMessage(ctx: CommunicationPolicyContext, message: Message): boolean;
  canManageMembers(ctx: CommunicationPolicyContext, room: Room): boolean;
}

export const defaultCommunicationPolicy: CommunicationPolicy = {
  canCreateRoom(ctx, input) {
    if (input.type === 'system') return ctx.roles.includes('admin');
    return true;
  },
  canSendMessage(ctx, room) {
    if (room.isReadOnly && room.createdBy !== ctx.userId && !ctx.roles.includes('admin')) {
      return false;
    }
    return true;
  },
  canEditMessage(ctx, message) {
    if (message.userId === ctx.userId) return true;
    return ctx.roles.includes('admin');
  },
  canDeleteMessage(ctx, message) {
    if (message.userId === ctx.userId) return true;
    return ctx.roles.includes('admin');
  },
  canManageMembers(ctx, room) {
    if (room.createdBy === ctx.userId) return true;
    return ctx.roles.includes('admin');
  }
};
