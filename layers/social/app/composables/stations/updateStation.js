// composables/updateStation.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function updateStation(stationId, stationData) {
    const { updateItem } = useAdapterRequest()

    try {
      const station = await updateItem('radios', stationId, stationData)
      return station;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
}
  