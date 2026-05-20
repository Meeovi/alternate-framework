// composables/deleteChart.js
import { useSdkContentAdapter } from '#imports'
export default async function deleteChart(chartId) {
    const { deleteItem } = useSdkContentAdapter()

    try {
      await deleteItem('musicchart', chartId)
      console.log('Chart deleted successfully');
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw error;
    }
}
  