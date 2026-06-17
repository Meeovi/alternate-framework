import { useCommunicationClient } from './useCommunicationClient';
import { clientEventBus } from '~/utils/eventBus';

export function usePresence(roomId: string) {
  const { request } = useCommunicationClient();

  const presence = useState(`communication:presence:${roomId}`, () => new Map());

  function syncRealtime() {
    clientEventBus.on('presence.updated', (p) => {
      presence.value.set(p.userId, p.status);
    });
  }

  async function update(status: string) {
    await request('/presence', {
      method: 'POST',
      body: JSON.stringify({ status })
    });
  }

  return {
    presence,
    update,
    syncRealtime
  };
}
