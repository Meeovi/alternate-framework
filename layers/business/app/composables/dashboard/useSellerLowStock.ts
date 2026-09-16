import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

/**
 * Products below their restock threshold — Webkul Multi Vendor
 * Marketplace's "Low Stock" seller-panel report, fetched through
 * `useBusinessDriver()`.
 */
export function useSellerLowStock() {
  const columns: IColumnConfig[] = [
    { id: 'name', header: [{ text: 'Product' }, { filter: 'text' }], sort: true, flexgrow: 1 },
    { id: 'sku', header: 'SKU', width: 130, sort: true },
    { id: 'stock', header: 'In Stock', width: 110, sort: true },
    { id: 'threshold', header: 'Threshold', width: 110, sort: true }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-low-stock',
    () => business.lowStock.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
