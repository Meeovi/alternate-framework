import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'draft', label: 'Draft' },
  { id: 'archived', label: 'Archived' }
]

/**
 * Fetches the signed-in seller's products through `useBusinessDriver()` —
 * a backend-agnostic proxy to `POST /api/business/driver`. Today that
 * resolves to `DefaultBusinessAdapter` (mock data); pointing it at a real
 * backend later is a server-side adapter swap, not a change here.
 */
export function useSellerProducts() {
  const columns: IColumnConfig[] = [
    { id: 'name', header: [{ text: 'Product' }, { filter: 'text' }], editor: 'text', sort: true, flexgrow: 2 },
    { id: 'sku', header: 'SKU', width: 130, sort: true },
    { id: 'category', header: 'Category', width: 150, sort: true },
    { id: 'price', header: 'Price', width: 110, sort: true, editor: 'text', template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'stock', header: 'Stock', width: 100, sort: true, editor: 'text' },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      editor: 'richselect',
      options: STATUS_OPTIONS,
      width: 130
    },
    { id: 'updated', header: 'Updated', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-products',
    () => business.products.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
