// composables/deleteChart.js

export default async function deleteChart(chartId) {
    const { $deleteItem } = useNuxtApp()

    try {
      await deleteItem('musicchart', chartId)
      console.log('Chart deleted successfully');
    } catch (error) {
      console.error('Error deleting chart:', error);
      throw error;
    }
}
  