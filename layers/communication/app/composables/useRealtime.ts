import { clientEventBus } from '~/utils/eventBus';

export function useRealtime() {
  const config = useRuntimeConfig();
  const provider = config.public.realtimeProvider; // "ably" | "pusher"

  let client: any = null;

  function init() {
    if (client) return;

    if (provider === 'ably') {
      const Ably = (window as any).Ably;
      client = new Ably.Realtime(config.public.ablyKey);
    }

    if (provider === 'pusher') {
      const Pusher = (window as any).Pusher;
      client = new Pusher(config.public.pusherKey, {
        cluster: config.public.pusherCluster
      });
    }
  }

  function subscribeRoom(roomId: string) {
    init();

    const channelName = `communication-room-${roomId}`;
    const channel = provider === 'ably'
      ? client.channels.get(channelName)
      : client.subscribe(channelName);

    const handler = (event: any) => {
      const type = provider === 'ably' ? event.name : event.event;
      const payload = provider === 'ably' ? event.data : event.data;

      clientEventBus.emit(type, payload);
    };

    if (provider === 'ably') channel.subscribe(handler);
    if (provider === 'pusher') channel.bind_global(handler);

    return () => {
      if (provider === 'ably') channel.unsubscribe(handler);
      if (provider === 'pusher') channel.unbind_global(handler);
    };
  }

  return {
    subscribeRoom
  };
}
