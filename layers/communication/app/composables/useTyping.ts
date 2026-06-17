import { clientEventBus } from '~/utils/eventBus';
import { useRealtime } from './useRealtime';

export function useTyping(roomId: string) {
  const { subscribeRoom } = useRealtime();

  const typing = useState(`communication:typing:${roomId}`, () => new Set<string>());

  function syncRealtime() {
    clientEventBus.on('typing.started', (evt) => {
      if (evt.roomId === roomId) typing.value.add(evt.userId);
    });

    clientEventBus.on('typing.stopped', (evt) => {
      if (evt.roomId === roomId) typing.value.delete(evt.userId);
    });
  }

  function init() {
    syncRealtime();
    subscribeRoom(roomId);
  }

  return {
    typing,
    init
  };
}
