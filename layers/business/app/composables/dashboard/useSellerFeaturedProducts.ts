import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const SLOT_OPTIONS = [
  { id: 'homepage', label: 'Homepage' },
  { id: 'category', label: 'Category' },
  { id: 'search', label: 'Search' }
]

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'pending', label: 'Pending' },
  { id: 'expired', label: 'Expired' }
]

/**
 * Paid featured-placement slots — Webkul Multi Vendor Marketplace's
 * "Featured Products" seller-panel feature, fetched through
 * `useBusinessDriver()`.
 */
export function useSellerFeaturedProducts() {
  const columns: IColumnConfig[] = [
    { id: 'product', header: [{ text: 'Product' }, { filter: 'text' }], flexgrow: 1, sort: true },
    {
      id: 'slot',
      header: { text: 'Slot', filter: { type: 'richselect', config: { options: SLOT_OPTIONS } } },
      options: SLOT_OPTIONS,
      width: 130
    },
    { id: 'cost', header: 'Cost', width: 100, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'startDate', header: 'Starts', width: 120, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'endDate', header: 'Ends', width: 120, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      options: STATUS_OPTIONS,
      width: 120
    }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-featured-products',
    () => business.featuredProducts.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
