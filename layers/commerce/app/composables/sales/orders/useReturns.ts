// layers/commerce/app/composables/sales/orders/useReturns.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { ReturnProvider, Return } from '../../../types/returns'

/**
 * Returns (RMA) composable. Replaces `sales/orders/useReturns.ts` and
 * `useCustomerReturns/*` with a single typed `ReturnProvider` entrypoint.
 */
export function useReturns() {
  const client = getCommerceClient() as unknown as ReturnProvider
  const returns = ref<Return[]>([])
  const current = ref<Return | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchReturns(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      returns.value = (await client.getReturns(params)).items
    } catch (err) {
      error.value = err as Error
      returns.value = []
    } finally {
      isLoading.value = false
    }
    return returns.value
  }

  async function fetchReturnById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getReturnById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createReturn(input: Parameters<ReturnProvider['createReturn']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.createReturn(input)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    returns,
    current,
    isLoading,
    error,
    fetchReturns,
    fetchReturnById,
    createReturn,
  }
}

export default useReturns
