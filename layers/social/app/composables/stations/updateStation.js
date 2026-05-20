// composables/updateStation.js
import { useSdkContentAdapter } from '#imports'

export default async function updateStation(stationId, stationData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const station = await updateItem('radios', stationId, stationData)
      return station;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
}
  