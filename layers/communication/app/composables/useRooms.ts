import { useCommunicationClient } from './useCommunicationClient';
import { useRealtime } from './useRealtime';

export function useRooms() {
  const { request } = useCommunicationClient();
  const { subscribeRoom } = useRealtime();

  const rooms = useState('communication:rooms', () => [] as any[]);
  const loading = ref(false);

  async function fetchRooms() {
    loading.value = true;
    const res = await request('/rooms');
    rooms.value = res.items;
    loading.value = false;
  }

  function watchRoom(roomId: string) {
    return subscribeRoom(roomId);
  }

  return {
    rooms,
    loading,
    fetchRooms,
    watchRoom
  };
}
