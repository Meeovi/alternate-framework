// composables/deleteStation.js
import { useSdkContentAdapter } from '#imports'
export default async function deleteStation(stationId) {
    const { deleteItem } = useSdkContentAdapter()

    try {
      await deleteItem('radios', stationId)
      console.log('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
}
  