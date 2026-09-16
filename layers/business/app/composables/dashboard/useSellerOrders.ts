import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const PAYMENT_OPTIONS = [
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'refunded', label: 'Refunded' }
]

const FULFILLMENT_OPTIONS = [
  { id: 'unfulfilled', label: 'Unfulfilled' },
  { id: 'processing', label: 'Processing' },
  { id: 'shipped', label: 'Shipped' },
  { id: 'delivered', label: 'Delivered' }
]

/**
 * Orders containing this seller's products — fetched through
 * `useBusinessDriver()`, not the buyer-facing order history `useOrders`
 * already covers in layers/commerce.
 */
export function useSellerOrders() {
  const columns: IColumnConfig[] = [
    { id: 'id', header: [{ text: 'Order' }, { filter: 'text' }], width: 110, sort: true },
    { id: 'customer', header: 'Customer', flexgrow: 1, sort: true },
    { id: 'items', header: 'Items', width: 80, sort: true },
    { id: 'total', header: 'Total', width: 110, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    {
      id: 'paymentStatus',
      header: { text: 'Payment', filter: { type: 'richselect', config: { options: PAYMENT_OPTIONS } } },
      options: PAYMENT_OPTIONS,
      width: 130
    },
    {
      id: 'fulfillmentStatus',
      header: { text: 'Fulfillment', filter: { type: 'richselect', config: { options: FULFILLMENT_OPTIONS } } },
      editor: 'richselect',
      options: FULFILLMENT_OPTIONS,
      width: 150
    },
    { id: 'placed', header: 'Placed', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-orders',
    () => business.orders.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
