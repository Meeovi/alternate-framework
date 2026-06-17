import { useCommunicationClient } from './useCommunicationClient';
import { useRealtime } from './useRealtime';
import { clientEventBus } from '~/utils/eventBus';

export function useMessages(roomId: string) {
  const { request } = useCommunicationClient();
  const { subscribeRoom } = useRealtime();

  const messages = useState(`communication:messages:${roomId}`, () => [] as any[]);
  const loading = ref(false);

  async function fetchMessages() {
    loading.value = true;
    const res = await request(`/rooms/${roomId}/messages`);
    messages.value = res;
    loading.value = false;
  }

  async function sendMessage(body: string, metadata?: any) {
    const msg = await request(`/rooms/${roomId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ body, metadata })
    });

    // optimistic update
    messages.value.unshift(msg);
  }

  function syncRealtime() {
    clientEventBus.on('message.created', (msg) => {
      if (msg.roomId === roomId) {
        messages.value.unshift(msg);
      }
    });

    clientEventBus.on('message.updated', (msg) => {
      if (msg.roomId === roomId) {
        const idx = messages.value.findIndex(m => m.id === msg.id);
        if (idx !== -1) messages.value[idx] = msg;
      }
    });

    clientEventBus.on('message.deleted', (evt) => {
      const idx = messages.value.findIndex(m => m.id === evt.messageId);
      if (idx !== -1) messages.value.splice(idx, 1);
    });
  }

  function init() {
    fetchMessages();
    syncRealtime();
    subscribeRoom(roomId);
  }

  return {
    messages,
    loading,
    fetchMessages,
    sendMessage,
    init
  };
}
