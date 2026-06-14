// composables/updateChart.js

export default async function updateChart(chartId, chartData) {
    const { $updateItem } = useNuxtApp()

    try {
      const chart = await updateItem('musicchart', chartId, chartData)
      return chart;
    } catch (error) {
      console.error('Error updating chart:', error);
      throw error;
    }
}
  