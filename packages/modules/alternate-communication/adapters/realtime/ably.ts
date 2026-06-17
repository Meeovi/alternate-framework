import Ably from 'ably';
import { RealtimeAdapter, RealtimeEvent } from '../../src/ports/realtime';

export interface AblyRealtimeAdapterOptions {
  apiKey: string;
  prefix?: string; // default: "communication"
}

export function createAblyRealtimeAdapter(
  options: AblyRealtimeAdapterOptions
): RealtimeAdapter {
  const client = new Ably.Realtime(options.apiKey);
  const prefix = options.prefix ?? 'communication';

  function channelForRoom(roomId: string) {
    return client.channels.get(`${prefix}:room:${roomId}`);
  }

  function channelForUser(userId: string) {
    return client.channels.get(`${prefix}:user:${userId}`);
  }

  return {
    async publish(event: RealtimeEvent): Promise<void> {
      if (event.roomId) {
        const ch = channelForRoom(event.roomId);
        await ch.publish(event.type, event.payload);
      } else if (event.userId) {
        const ch = channelForUser(event.userId);
        await ch.publish(event.type, event.payload);
      } else {
        const ch = client.channels.get(`${prefix}:global`);
        await ch.publish(event.type, event.payload);
      }
    },

    async subscribe(handler: (event: RealtimeEvent) => void): Promise<void> {
      const global = client.channels.get(`${prefix}:global`);
      global.subscribe((msg) => {
        handler({
          type: msg.name as any,
          payload: msg.data
        });
      });
    }
  };
}
