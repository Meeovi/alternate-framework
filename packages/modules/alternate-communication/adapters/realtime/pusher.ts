import Pusher from 'pusher';
import { RealtimeAdapter, RealtimeEvent } from '../../src/ports/realtime';

export interface PusherRealtimeAdapterOptions {
  appId: string;
  key: string;
  secret: string;
  cluster: string;
  useTLS?: boolean;
  prefix?: string; // default: "communication"
}

export function createPusherRealtimeAdapter(
  options: PusherRealtimeAdapterOptions
): RealtimeAdapter {
  const prefix = options.prefix ?? 'communication';

  const pusher = new Pusher({
    appId: options.appId,
    key: options.key,
    secret: options.secret,
    cluster: options.cluster,
    useTLS: options.useTLS ?? true
  });

  function channelForRoom(roomId: string) {
    return `${prefix}-room-${roomId}`;
  }

  function channelForUser(userId: string) {
    return `${prefix}-user-${userId}`;
  }

  return {
    async publish(event: RealtimeEvent): Promise<void> {
      if (event.roomId) {
        await pusher.trigger(channelForRoom(event.roomId), event.type, event.payload);
      } else if (event.userId) {
        await pusher.trigger(channelForUser(event.userId), event.type, event.payload);
      } else {
        await pusher.trigger(`${prefix}-global`, event.type, event.payload);
      }
    },

    // Pusher server SDK does not support server-side subscribe.
    // We expose a no-op to satisfy the interface.
    async subscribe(): Promise<void> {
      return;
    }
  };
}
