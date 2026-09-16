import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const STATUS_OPTIONS = [
  { id: 'paid', label: 'Paid' },
  { id: 'pending', label: 'Pending' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'void', label: 'Void' }
]

/**
 * Seller payout/billing invoices — fetched through `useBusinessDriver()`,
 * distinct from the buyer-facing `useInvoices` composable in
 * layers/commerce.
 */
export function useSellerInvoices() {
  const columns: IColumnConfig[] = [
    { id: 'id', header: [{ text: 'Invoice' }, { filter: 'text' }], width: 120, sort: true },
    { id: 'order', header: 'Order', width: 110, sort: true },
    { id: 'amount', header: 'Amount', width: 110, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'issuedDate', header: 'Issued', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'dueDate', header: 'Due', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      editor: 'richselect',
      options: STATUS_OPTIONS,
      width: 130
    }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-invoices',
    () => business.invoices.list(),
    { default: () => [] }
  )

  return { columns, rows, pending, error, refresh }
}
