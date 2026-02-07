// composables/deleteChart.js
import useAdapterRequest from '~/composables/useAdapterRequest'

export default async function deleteChart(chartId) {
    const { deleteItem } = useAdapterRequest()

    try {
      await deleteItem('musicchart', chartId)
      console.log('Chart deleted successfully');
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw error;
    }
}
  