import VueApexCharts from 'vue3-apexcharts'

// Registers <apexchart> for the dashboard widgets (client-only: ApexCharts
// touches `window` on import).
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueApexCharts)
})
