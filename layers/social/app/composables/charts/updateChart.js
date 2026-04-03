// composables/updateChart.js
import useAdapterRequest from '#social/app/composables/core/useAdapterRequest'

export default async function updateChart(chartId, chartData) {
    const { updateItem } = useAdapterRequest()

    try {
      const chart = await updateItem('musicchart', chartId, chartData)
      return chart;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
}
  