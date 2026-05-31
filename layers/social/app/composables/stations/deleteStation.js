// composables/deleteStation.js
import useContent from '#shared/app/composables/content/useContent'
export default async function deleteStation(stationId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('radios', stationId)
      console.log('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
}
  