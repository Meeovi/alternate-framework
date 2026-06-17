import { CommunicationDomainEvent } from './contracts';
import { RealtimeAdapter } from '../ports/realtime';

export interface EventBus {
  publish(event: CommunicationDomainEvent): Promise<void>;
}

export function createEventBus(realtime: RealtimeAdapter): EventBus {
  return {
    async publish(event) {
      switch (event.type) {
        case 'room.created':
        case 'room.updated':
          await realtime.publish({
            type: event.type,
            payload: event.room,
            roomId: event.room.id,
            userId: event.room.createdBy
          });
          break;
        case 'message.created':
        case 'message.updated':
          await realtime.publish({
            type: event.type,
            payload: event.message,
            roomId: event.message.roomId,
            userId: event.message.userId
          });
          break;
        case 'message.deleted':
          await realtime.publish({
            type: 'message.deleted',
            payload: { messageId: event.messageId },
            roomId: event.roomId
          });
          break;
        case 'reaction.added':
        case 'reaction.removed':
          await realtime.publish({
            type: event.type,
            payload: event.reaction,
            roomId: event.reaction.messageId,
            userId: event.reaction.userId
          });
          break;
        case 'presence.updated':
          await realtime.publish({
            type: 'presence.updated',
            payload: event.presence,
            userId: event.presence.userId
          });
          break;
      }
    }
  };
}
