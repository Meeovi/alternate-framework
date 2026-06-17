import { Room } from '../domain/entities/Room';
import { Message } from '../domain/entities/Message';
import { Reaction } from '../domain/entities/Reaction';
import { Presence } from '../domain/entities/Presence';

export type CommunicationDomainEvent =
  | { type: 'room.created'; room: Room }
  | { type: 'room.updated'; room: Room }
  | { type: 'message.created'; message: Message }
  | { type: 'message.updated'; message: Message }
  | { type: 'message.deleted'; messageId: string; roomId: string }
  | { type: 'reaction.added'; reaction: Reaction }
  | { type: 'reaction.removed'; reaction: Reaction }
  | { type: 'presence.updated'; presence: Presence };
