// layers/commerce/app/composables/sales/useTransactions.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'
import type { TransactionProvider, Transaction } from '../../types/transactions'

/**
 * Transactions composable. Replaces `sales/useTransactions.ts`, typed against
 * `TransactionProvider`.
 */
export function useTransactions() {
  const client = getCommerceClient() as unknown as TransactionProvider
  const transactions = ref<Transaction[]>([])
  const current = ref<Transaction | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchTransactions(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      transactions.value = await client.getTransactions(params)
    } catch (err) {
      error.value = err as Error
      transactions.value = []
    } finally {
      isLoading.value = false
    }
    return transactions.value
  }

  async function fetchTransactionById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getTransactionById(id)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    transactions,
    current,
    isLoading,
    error,
    fetchTransactions,
    fetchTransactionById,
  }
}

export default useTransactions
