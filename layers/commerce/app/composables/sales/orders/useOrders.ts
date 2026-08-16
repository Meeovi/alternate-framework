// layers/commerce/app/composables/sales/orders/useOrders.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { OrderProvider, Order } from '../../../types/orders'

/**
 * Orders composable. Replaces the spread-out `sales/orders/orders.ts`,
 * `useCustomerOrders/*` and `useCustomerOrder/*` with a single typed entrypoint.
 */
export function useOrders() {
  const client = getCommerceClient() as unknown as OrderProvider
  const orders = ref<Order[]>([])
  const current = ref<Order | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchOrders(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      orders.value = (await client.getOrders(params)).items
    } catch (err) {
      error.value = err as Error
      orders.value = []
    } finally {
      isLoading.value = false
    }
    return orders.value
  }

  async function fetchOrderById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      // The adapter's real method is getOrder, not getOrderById — this
      // threw TypeError on every call against Magento.
      current.value = await client.getOrder(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchOrderByIncrementId(incrementId: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getOrderByIncrementId(incrementId)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function cancelOrder(id: string, reason?: string) {
    isLoading.value = true
    error.value = null
    try {
      // No adapter implements order cancellation today (Magento has no
      // cancelOrder method at all — this previously threw an opaque
      // TypeError instead of a clear "not supported" error). Real
      // cancellation needs a verified Magento mutation; adapter-magento's
      // existing mutation methods have not been live-tested against a
      // real Magento write (see the wider readEntity/mutateEntity
      // mismatch across most of its write methods).
      if (typeof client.cancelOrder !== 'function') {
        throw new Error('Order cancellation is not supported by the active commerce backend yet.')
      }
      current.value = await client.cancelOrder(id, reason)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    orders,
    current,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    fetchOrderByIncrementId,
    cancelOrder,
  }
}

export default useOrders
