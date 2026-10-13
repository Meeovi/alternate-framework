<script setup lang="ts">
// Sellers' reporting on one page: charts built from the same tables API the
// sales / catalog pages use (adapter rows or Directus), and compact tables
// (cols="4") linking to the full pages.
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Reports' })

type Row = Record<string, any>
type TableResponse = { rows: Row[], total: number, notice?: string }

const fetcher = useRequestFetch()
const load = (collection: string, sort: string) =>
  fetcher<TableResponse>(`/api/tables/${collection}`, { query: { pageSize: 200, sort } })
    .catch(() => ({ rows: [], total: 0 } as TableResponse))

const { data, pending } = await useAsyncData('reports:data', async () => {
  const [orders, products, transactions] = await Promise.all([
    load('orders', '-date_created'),
    load('products', 'name'),
    load('transactions', '-date_created'),
  ])
  return { orders, products, transactions }
})

function countBy(rows: Row[], key: string) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = String(row[key] ?? 'unknown') || 'unknown'
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return { labels: [...counts.keys()], series: [...counts.values()] }
}

const orderStatus = computed(() => countBy(data.value?.orders.rows ?? [], 'status'))
const productStatus = computed(() => countBy(data.value?.products.rows ?? [], 'status'))
const transactionStatus = computed(() => countBy(data.value?.transactions.rows ?? [], 'status'))

// Revenue per month (last 12 months) from orders' grand totals.
const revenue = computed(() => {
  const now = new Date()
  const months = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), now.getMonth() - 11 + i, 1))
  const totals = months.map(() => 0)
  for (const order of data.value?.orders.rows ?? []) {
    const date = new Date(order.date_created ?? order.created_at)
    if (Number.isNaN(date.getTime())) continue
    const index = months.findIndex((m) => m.getFullYear() === date.getFullYear() && m.getMonth() === date.getMonth())
    if (index >= 0) totals[index] += Number(order.grand_total ?? order.base_grand_total) || 0
  }
  return {
    categories: months.map((m) => m.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })),
    series: [{ name: 'Revenue', data: totals.map((t) => Math.round(t * 100) / 100) }],
  }
})

const donut = (labels: string[]) => ({
  chart: { type: 'donut', fontFamily: 'inherit' },
  labels,
  legend: { position: 'bottom' },
  dataLabels: { enabled: false },
  noData: { text: 'No data yet' },
})

const revenueOptions = computed(() => ({
  chart: { type: 'bar', fontFamily: 'inherit', toolbar: { show: false } },
  xaxis: { categories: revenue.value.categories },
  dataLabels: { enabled: false },
  colors: ['#5e35b1'],
  noData: { text: 'No orders yet' },
}))

const charts = computed(() => [
  { title: 'Orders by status', total: data.value?.orders.total ?? 0, ...orderStatus.value },
  { title: 'Products by status', total: data.value?.products.total ?? 0, ...productStatus.value },
  { title: 'Transactions by status', total: data.value?.transactions.total ?? 0, ...transactionStatus.value },
])

const tables = [
  { collection: 'orders', link: '/workspace/sales/orders' },
  { collection: 'invoices', link: '/workspace/sales/invoices' },
  { collection: 'transactions', link: '/workspace/sales/transactions' },
  { collection: 'payments', link: '/workspace/sales/payments' },
  { collection: 'products', link: '/workspace/catalog/products' },
  { collection: 'reviews', link: '/workspace/marketing/reviews' },
]
</script>

<template>
  <div class="contentPage">
    <v-toolbar color="primary" class="mb-4">
      <v-toolbar-title>Reports</v-toolbar-title>
    </v-toolbar>

    <v-row>
      <v-col v-for="chart in charts" :key="chart.title" cols="12" md="4">
        <v-card elevation="0" class="pa-4" height="100%">
          <div class="d-flex align-center mb-2">
            <strong>{{ chart.title }}</strong>
            <v-spacer />
            <span class="text-medium-emphasis">{{ chart.total.toLocaleString() }} total</span>
          </div>
          <ClientOnly>
            <apexchart v-if="chart.series.length" type="donut" height="240" :options="donut(chart.labels)" :series="chart.series" />
            <div v-else class="reports__empty">{{ pending ? 'Loading…' : 'No data yet' }}</div>
          </ClientOnly>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card elevation="0" class="pa-4">
          <strong>Revenue by month</strong>
          <ClientOnly>
            <apexchart type="bar" height="280" :options="revenueOptions" :series="revenue.series" />
          </ClientOnly>
        </v-card>
      </v-col>

      <v-col v-for="table in tables" :key="table.collection" cols="12" md="4">
        <v-card elevation="0" class="pa-3">
          <div style="padding: 10px">
            <MeeoviTable :collection="table.collection" :link="table.link" compact :page-size="5" height="300px" />
          </div>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<style scoped>
.reports__empty {
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}
</style>
