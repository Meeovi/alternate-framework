// composables/deleteChart.js
import useContent from '#shared/app/composables/content/useContent'
export default async function deleteChart(chartId) {
    const { deleteItem } = useContent()

    try {
      await deleteItem('musicchart', chartId)
      console.log('Chart deleted successfully');
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw error;
    }
}
  