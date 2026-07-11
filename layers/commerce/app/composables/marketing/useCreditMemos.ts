// layers/commerce/app/composables/marketing/useCreditMemos.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'
import type { CreditMemoProvider, CreditMemo } from '../../types/credit-memos'

/**
 * Credit-memo composable. Replaces `marketing/useCreditMemo.ts`, typed against
 * `CreditMemoProvider`.
 */
export function useCreditMemos() {
  const client = getCommerceClient() as unknown as CreditMemoProvider
  const creditMemos = ref<CreditMemo[]>([])
  const current = ref<CreditMemo | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchCreditMemos(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      creditMemos.value = (await client.getCreditMemos(params)).items
    } catch (err) {
      error.value = err as Error
      creditMemos.value = []
    } finally {
      isLoading.value = false
    }
    return creditMemos.value
  }

  async function fetchCreditMemoById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getCreditMemoById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function createCreditMemo(input: Parameters<CreditMemoProvider['createCreditMemo']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.createCreditMemo(input)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    creditMemos,
    current,
    isLoading,
    error,
    fetchCreditMemos,
    fetchCreditMemoById,
    createCreditMemo,
  }
}

export default useCreditMemos
