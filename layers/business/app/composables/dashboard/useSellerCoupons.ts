import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'active', label: 'Active' },
  { id: 'expired', label: 'Expired' },
  { id: 'scheduled', label: 'Scheduled' }
]

/**
 * Seller-scoped promo codes — Webkul Multi Vendor Marketplace's "Seller
 * Coupons" seller-panel feature, fetched through `useBusinessDriver()`.
 */
export function useSellerCoupons() {
  const columns: IColumnConfig[] = [
    { id: 'code', header: [{ text: 'Code' }, { filter: 'text' }], editor: 'text', sort: true, width: 150 },
    {
      id: 'discountType',
      header: 'Type',
      width: 100,
      template: (value: string) => value === 'percent' ? 'Percent' : 'Fixed'
    },
    // Shown alongside the Type column rather than self-formatted (a percent
    // discount of "10" and a fixed discount of "5" both read fine next to
    // "Percent"/"Fixed" without needing cross-column context here).
    { id: 'discountValue', header: 'Value', width: 90, sort: true },
    { id: 'usageLimit', header: 'Limit', width: 90, sort: true },
    { id: 'usedCount', header: 'Used', width: 90, sort: true },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      options: STATUS_OPTIONS,
      width: 130
    },
    { id: 'validFrom', header: 'From', width: 120, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'validTo', header: 'To', width: 120, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-coupons',
    () => business.coupons.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
