export type RealtimeEventType =
  | 'room.created'
  | 'room.updated'
  | 'message.created'
  | 'message.updated'
  | 'message.deleted'
  | 'reaction.added'
  | 'reaction.removed'
  | 'presence.updated'
  | 'typing.started'
  | 'typing.stopped';

export interface RealtimeEvent {
  type: RealtimeEventType;
  payload: any;
  roomId?: string;
  userId?: string;
}

export interface RealtimeAdapter {
  publish(event: RealtimeEvent): Promise<void>;
  subscribe?(handler: (event: RealtimeEvent) => void): Promise<void>;
}
