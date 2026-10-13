<script setup lang="ts">
const props = defineProps<{
  years: number[]
  months: string[]
  revenueByMonth: (year: number) => { paid: number[], pending: number[], refunded: number[] }
}>()

const year = ref(props.years[0] ?? new Date().getFullYear())

const revenue = computed(() => props.revenueByMonth(year.value))
const total = computed(() => revenue.value.paid.reduce((sum, value) => sum + value, 0))

const series = computed(() => [
  { name: 'Paid', data: revenue.value.paid.map((v) => Math.round(v * 100) / 100) },
  { name: 'Pending', data: revenue.value.pending.map((v) => Math.round(v * 100) / 100) },
  { name: 'Refunded', data: revenue.value.refunded.map((v) => Math.round(v * 100) / 100) }
])

const chartOptions = computed(() => ({
  chart: { type: 'bar', height: 480, fontFamily: 'inherit', foreColor: '#a1aab2', stacked: true, toolbar: { show: false } },
  colors: ['#5e35b1', '#1e88e5', '#ede7f6'],
  plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
  xaxis: { type: 'category', categories: props.months },
  yaxis: { labels: { formatter: (value: number) => formatMoney(value) } },
  legend: {
    show: true,
    position: 'bottom',
    offsetX: 20,
    labels: { useSeriesColors: false },
    markers: { width: 16, height: 16, radius: 5 },
    itemMargin: { horizontal: 15, vertical: 8 }
  },
  fill: { type: 'solid' },
  dataLabels: { enabled: false },
  grid: { show: true },
  tooltip: { theme: 'dark', y: { formatter: (value: number) => formatMoney(value) } }
}))
</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <v-row>
          <v-col cols="12" sm="9">
            <span class="text-subtitle-2 text-disabled font-weight-bold">Paid revenue in {{ year }}</span>
            <h3 class="text-h3 mt-1">{{ formatMoney(total) }}</h3>
          </v-col>
          <v-col cols="12" sm="3">
            <v-select v-model="year" color="primary" variant="outlined" hide-details :items="years" label="Year" single-line />
          </v-col>
        </v-row>
        <div class="mt-4">
          <ClientOnly>
            <apexchart type="bar" height="480" :options="chartOptions" :series="series" />
          </ClientOnly>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>
