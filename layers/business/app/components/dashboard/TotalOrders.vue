<script setup lang="ts">
const props = defineProps<{ month: number, year: number, trend: number[] }>()

const tab = ref('month')

const chartOptions = {
  chart: { type: 'line', height: 90, fontFamily: 'inherit', foreColor: '#a1aab2', sparkline: { enabled: true } },
  dataLabels: { enabled: false },
  colors: ['#fff'],
  fill: { type: 'solid', opacity: 1 },
  stroke: { curve: 'smooth', width: 3 },
  yaxis: { min: 0 },
  tooltip: {
    theme: 'dark',
    fixed: { enabled: false },
    x: { show: false },
    y: { title: { formatter: () => 'Orders' } },
    marker: { show: false }
  }
}

const series = computed(() => [{ name: 'Orders', data: props.trend }])
</script>

<template>
  <v-card elevation="0" class="bg-primary overflow-hidden bubble-shape bubble-primary-shape">
    <v-card-text>
      <div class="d-flex align-start mb-3">
        <v-btn icon rounded="sm" color="darkprimary" variant="flat" to="/workspace/sales/orders" aria-label="Orders">
          <v-icon icon="fas fa-cart-shopping" size="18" />
        </v-btn>
        <div class="ml-auto z-1">
          <v-tabs v-model="tab" class="theme-tab" density="compact" end>
            <v-tab value="month" hide-slider color="transparent">Month</v-tab>
            <v-tab value="year" hide-slider color="transparent">Year</v-tab>
          </v-tabs>
        </div>
      </div>
      <v-row class="z-1 position-relative">
        <v-col cols="6">
          <h2 class="text-h1 font-weight-medium">{{ tab === 'month' ? month : year }}</h2>
          <span class="text-subtitle-1 text-medium-emphasis text-white">
            Orders in the last {{ tab === 'month' ? '30 days' : '12 months' }}
          </span>
        </v-col>
        <v-col cols="6">
          <ClientOnly>
            <apexchart type="line" height="90" :options="chartOptions" :series="series" />
          </ClientOnly>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>
