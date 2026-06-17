import { clientEventBus } from '~/utils/eventBus';
import { useCommunicationClient } from './useCommunicationClient';

export function useReactions(roomId: string) {
  const { request } = useCommunicationClient();

  const reactions = useState(`communication:reactions:${roomId}`, () => new Map());

  function syncRealtime() {
    clientEventBus.on('reaction.added', (r) => {
      const list = reactions.value.get(r.messageId) ?? [];
      reactions.value.set(r.messageId, [...list, r]);
    });

    clientEventBus.on('reaction.removed', (r) => {
      const list = reactions.value.get(r.messageId) ?? [];
      reactions.value.set(
        r.messageId,
        list.filter(x => !(x.userId === r.userId && x.emoji === r.emoji))
      );
    });
  }

  async function add(messageId: string, emoji: string) {
    await request(`/messages/${messageId}/reactions`, {
      method: 'POST',
      body: JSON.stringify({ emoji })
    });
  }

  async function remove(messageId: string, emoji: string) {
    await request(`/messages/${messageId}/reactions`, {
      method: 'DELETE',
      body: JSON.stringify({ emoji })
    });
  }

  return {
    reactions,
    add,
    remove,
    syncRealtime
  };
}
