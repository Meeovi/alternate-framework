import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'label_created', label: 'Label Created' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'out_for_delivery', label: 'Out For Delivery' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'exception', label: 'Exception' }
]

/**
 * Shipments for orders containing this seller's products — fetched
 * through `useBusinessDriver()`.
 * `layers/commerce/server/api/shipment/my-shipments.get.ts` returns a
 * similar shape but scoped to the signed-in buyer; a seller-scoped
 * backend adapter for this driver would filter by vendor instead.
 */
export function useSellerShipments() {
  const columns: IColumnConfig[] = [
    { id: 'order', header: [{ text: 'Order' }, { filter: 'text' }], width: 110, sort: true },
    { id: 'carrier', header: 'Carrier', width: 130, sort: true },
    { id: 'trackingNumber', header: 'Tracking #', flexgrow: 1, sort: true },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      editor: 'richselect',
      options: STATUS_OPTIONS,
      width: 160
    },
    { id: 'shipped', header: 'Shipped', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-shipments',
    () => business.shipments.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
