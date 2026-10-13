import type { BusinessStats, SellerOrder } from 'alternate-sdk/contracts'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY = 24 * 60 * 60 * 1000

/**
 * Home-dashboard data for the signed-in seller. Goes through layers/business'
 * `useBusinessDriver()` (POST /api/business/driver) only, so this app never
 * knows which backend — Magento/Webkul, mock, or a future one selected with
 * BUSINESS_BACKEND — is answering.
 */
export function useWorkspaceDashboard() {
  const business = useBusinessDriver()

  const { data, pending, error, refresh } = useAsyncData('workspace:dashboard', async () => {
    const [stats, orders] = await Promise.all([
      business.getStats() as Promise<BusinessStats>,
      business.orders.list() as Promise<SellerOrder[]>,
    ])
    return { stats, orders: orders ?? [] }
  })

  const stats = computed(() => data.value?.stats)
  const orders = computed(() => data.value?.orders ?? [])

  // 403 = signed in, but not a seller (requireSeller on the driver route)
  const notSeller = computed(() => (error.value as { statusCode?: number } | null)?.statusCode === 403)

  const placedAt = (order: SellerOrder) => new Date(order.placed).getTime()

  function ordersSince(days: number) {
    const from = Date.now() - days * DAY
    return orders.value.filter((order) => placedAt(order) >= from)
  }

  /** Order counts for the last `count` calendar months, oldest first. */
  function monthlyOrderCounts(count: number) {
    const now = new Date()
    return Array.from({ length: count }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - (count - 1 - i), 1)
      return orders.value.filter((order) => {
        const placed = new Date(order.placed)
        return placed.getFullYear() === month.getFullYear() && placed.getMonth() === month.getMonth()
      }).length
    })
  }

  const years = computed(() => {
    const set = new Set(orders.value.map((order) => new Date(order.placed).getFullYear()).filter((y) => !Number.isNaN(y)))
    set.add(new Date().getFullYear())
    return [...set].sort((a, b) => b - a)
  })

  /** Revenue per month of `year`, split by payment status. */
  function revenueByMonth(year: number) {
    const series = { paid: Array(12).fill(0), pending: Array(12).fill(0), refunded: Array(12).fill(0) }
    for (const order of orders.value) {
      const placed = new Date(order.placed)
      if (placed.getFullYear() !== year) continue
      const bucket = series[order.paymentStatus] ?? series.pending
      bucket[placed.getMonth()] += Number(order.total) || 0
    }
    return series
  }

  return {
    stats,
    orders,
    pending,
    error,
    notSeller,
    refresh,
    years,
    months: MONTHS,
    ordersSince,
    monthlyOrderCounts,
    revenueByMonth,
  }
}

export function formatMoney(value: number | undefined) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value ?? 0)
}
