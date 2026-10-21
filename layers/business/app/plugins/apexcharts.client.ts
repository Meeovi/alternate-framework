import { defineAsyncComponent } from 'vue'

// Registers <apexchart> for the dashboard widgets (client-only: ApexCharts
// touches `window` on import). Async, so ApexCharts downloads when a chart
// first renders instead of shipping in the entry chunk of every page.
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('apexchart', defineAsyncComponent(() => import('vue3-apexcharts')))
})
