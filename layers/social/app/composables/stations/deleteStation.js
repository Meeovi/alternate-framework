// composables/deleteStation.js

export default async function deleteStation(stationId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('radios', stationId)
      console.log('Station deleted successfully');
    } catch (error) {
      console.error('Error deleting station:', error);
      throw error;
    }
}
  