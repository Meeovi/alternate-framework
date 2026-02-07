// composables/deleteStation.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function deleteStation(stationId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('radios', stationId)
      console.log('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
}
  