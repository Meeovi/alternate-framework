// composables/updateStation.js

export default async function updateStation(stationId, stationData) {
    const { $updateItem } = useNuxtApp()

    try {
      const station = await updateItem('radios', stationId, stationData)
      return station;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
}
  