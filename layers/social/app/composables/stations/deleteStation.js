// composables/deleteStation.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

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
  