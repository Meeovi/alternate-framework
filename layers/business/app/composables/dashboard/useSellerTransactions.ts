import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

/**
 * Per-order-item commission ledger — Webkul Multi Vendor Marketplace's
 * "Transactions" seller-panel report, fetched through
 * `useBusinessDriver()`. Distinct from `invoices` (seller billing) and
 * `orders` (order-level status) already covered by the dashboard.
 */
export function useSellerTransactions() {
  const columns: IColumnConfig[] = [
    { id: 'order', header: [{ text: 'Order' }, { filter: 'text' }], width: 110, sort: true },
    { id: 'product', header: 'Product', flexgrow: 1, sort: true },
    { id: 'saleAmount', header: 'Sale', width: 100, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'commissionRate', header: 'Rate', width: 80, sort: true, template: (value: number) => `${(value * 100).toFixed(0)}%` },
    { id: 'commissionAmount', header: 'Commission', width: 110, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'netEarning', header: 'Net Earning', width: 110, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'date', header: 'Date', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-transactions',
    () => business.transactions.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
