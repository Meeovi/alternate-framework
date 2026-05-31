// composables/updateChart.js
import useContent from '#shared/app/composables/content/useContent'
export default async function updateChart(chartId, chartData) {
    const { updateItem } = useContent()

    try {
      const chart = await updateItem('musicchart', chartId, chartData)
      return chart;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
}
  