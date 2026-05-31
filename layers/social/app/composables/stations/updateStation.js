// composables/updateStation.js
import useContent from '#shared/app/composables/content/useContent'

export default async function updateStation(stationId, stationData) {
    const { updateItem } = useContent()

    try {
      const station = await updateItem('radios', stationId, stationData)
      return station;
    } catch (error) {
      console.error('Error updating station:', error);
      throw error;
    }
}
  