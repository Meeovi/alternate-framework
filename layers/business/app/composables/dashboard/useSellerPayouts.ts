import { ref } from 'vue'
import type { IColumnConfig } from '@svar-ui/vue-grid'
import { useBusinessDriver } from '~/composables/useBusinessDriver'

const METHOD_OPTIONS = [
  { id: 'paypal', label: 'PayPal' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'store_credit', label: 'Store Credit' }
]

const STATUS_OPTIONS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'paid', label: 'Paid' },
  { id: 'rejected', label: 'Rejected' }
]

/**
 * Payout history plus a "request payout" action — Webkul Multi Vendor
 * Marketplace's seller-panel Payments section, fetched/mutated through
 * `useBusinessDriver()`.
 */
export function useSellerPayouts() {
  const columns: IColumnConfig[] = [
    { id: 'id', header: [{ text: 'Payout' }, { filter: 'text' }], width: 120, sort: true },
    { id: 'amount', header: 'Amount', width: 110, sort: true, template: (value: number) => `$${value.toFixed(2)}` },
    { id: 'method', header: 'Method', width: 140, sort: true, template: (value: string) => METHOD_OPTIONS.find((m) => m.id === value)?.label ?? value },
    {
      id: 'status',
      header: { text: 'Status', filter: { type: 'richselect', config: { options: STATUS_OPTIONS } } },
      options: STATUS_OPTIONS,
      width: 130
    },
    { id: 'requestedDate', header: 'Requested', width: 130, sort: true, template: (value: string) => new Date(value).toLocaleDateString() },
    { id: 'paidDate', header: 'Paid', width: 130, sort: true, template: (value: string | null) => value ? new Date(value).toLocaleDateString() : '—' }
  ]

  const business = useBusinessDriver()
  const { data: rows, pending, error, refresh } = useAsyncData(
    'seller-payouts',
    () => business.payouts.list(),
    { default: () => [] }
  )

  const requesting = ref(false)
  const requestError = ref<unknown>(null)

  async function requestPayout(amount: number, method: 'paypal' | 'bank_transfer' | 'store_credit') {
    requesting.value = true
    requestError.value = null
    try {
      await business.payouts.request({ amount, method })
      await refresh()
    } catch (e) {
      requestError.value = e
    } finally {
      requesting.value = false
    }
  }

  return { columns, rows, pending, error, refresh, methodOptions: METHOD_OPTIONS, requesting, requestError, requestPayout }
}
