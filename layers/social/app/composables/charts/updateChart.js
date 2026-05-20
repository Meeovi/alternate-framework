// composables/updateChart.js
import { useSdkContentAdapter } from '#imports'
export default async function updateChart(chartId, chartData) {
    const { updateItem } = useSdkContentAdapter()

    try {
      const chart = await updateItem('musicchart', chartId, chartData)
      return chart;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
}
  