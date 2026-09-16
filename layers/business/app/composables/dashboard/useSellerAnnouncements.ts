import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

/**
 * Admin-to-seller broadcast messages — Webkul Multi Vendor Marketplace's
 * "Seller Announcements" / notification feed, fetched through
 * `useBusinessDriver()`. Read-only from the seller's side.
 */
export function useSellerAnnouncements() {
  const columns: IColumnConfig[] = [
    { id: 'title', header: [{ text: 'Title' }, { filter: 'text' }], sort: true, flexgrow: 1 },
    { id: 'message', header: 'Message', flexgrow: 2 },
    { id: 'from', header: 'From', width: 150, sort: true },
    { id: 'date', header: 'Date', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'read', header: 'Read', width: 90, template: (value: boolean) => value ? 'Yes' : 'No' }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-announcements',
    () => business.announcements.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
