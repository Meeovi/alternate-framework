// layers/commerce/app/composables/marketing/useRewards.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'
import type {
  RewardProvider,
  RewardAccount,
  RewardPointTransaction,
} from '../../types/rewards'

/**
 * Rewards / loyalty composable. Replaces `marketing/useRewards.ts`, typed
 * against `RewardProvider`.
 */
export function useRewards() {
  const client = getCommerceClient() as unknown as RewardProvider
  const account = ref<RewardAccount | null>(null)
  const transactions = ref<RewardPointTransaction[]>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchAccount(customerId: string) {
    isLoading.value = true
    error.value = null
    try {
      account.value = await client.getAccount(customerId)
      return account.value
    } catch (err) {
      error.value = err as Error
      account.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTransactions(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      transactions.value = (await client.getTransactions(params)).items
    } catch (err) {
      error.value = err as Error
      transactions.value = []
    } finally {
      isLoading.value = false
    }
    return transactions.value
  }

  async function earn(customerId: string, points: number, action?: Parameters<RewardProvider['earn']>[2], referenceId?: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.earn(customerId, points, action, referenceId)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function redeem(customerId: string, points: number, orderId?: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.redeem(customerId, points, orderId)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    account,
    transactions,
    isLoading,
    error,
    fetchAccount,
    fetchTransactions,
    earn,
    redeem,
  }
}

export default useRewards
