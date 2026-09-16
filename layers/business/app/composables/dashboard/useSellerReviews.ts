import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'published', label: 'Published' },
  { id: 'pending', label: 'Pending' },
  { id: 'flagged', label: 'Flagged' }
]

/**
 * Reviews left on this seller's products, with a moderation status the
 * storefront-facing review composables don't track — fetched through
 * `useBusinessDriver()`.
 */
export function useSellerReviews() {
  const columns: IColumnConfig[] = [
    { id: 'product', header: [{ text: 'Product' }, { filter: 'text' }], flexgrow: 1, sort: true },
    { id: 'customer', header: 'Customer', width: 160, sort: true },
    { id: 'rating', header: 'Rating', width: 90, sort: true, template: (value: number) => '★'.repeat(value) },
    { id: 'comment', header: 'Comment', flexgrow: 2 },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      editor: 'richselect',
      options: STATUS_OPTIONS,
      width: 130
    },
    { id: 'date', header: 'Date', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-reviews',
    () => business.reviews.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
