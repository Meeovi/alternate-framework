// layers/commerce/app/composables/sales/orders/useInvoices.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { InvoiceProvider, Invoice } from '../../../types/invoices'

/**
 * Invoices composable. Replaces the spread-out invoice helpers, now typed
 * against `InvoiceProvider`.
 */
export function useInvoices() {
  const client = getCommerceClient() as unknown as InvoiceProvider
  const invoices = ref<Invoice[]>([])
  const current = ref<Invoice | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchInvoices(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      invoices.value = (await client.getInvoices(params)).items
    } catch (err) {
      error.value = err as Error
      invoices.value = []
    } finally {
      isLoading.value = false
    }
    return invoices.value
  }

  async function fetchInvoiceById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getInvoiceById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createInvoiceFromOrder(orderId: string, items?: Array<{ orderItemId: string; qty: number }>) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.createInvoiceFromOrder(orderId, items)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function captureInvoice(invoiceId: string, transactionId: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.captureInvoice(invoiceId, transactionId)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    invoices,
    current,
    isLoading,
    error,
    fetchInvoices,
    fetchInvoiceById,
    createInvoiceFromOrder,
    captureInvoice,
  }
}

export default useInvoices
