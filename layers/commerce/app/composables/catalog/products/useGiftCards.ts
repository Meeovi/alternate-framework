// layers/commerce/app/composables/catalog/products/useGiftCards.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { GiftCardProvider, GiftCard } from '../../../types/gift-cards'

/**
 * Gift-card composable. Replaces the old `useGiftCards.ts` wrapper with a fully
 * typed `GiftCardProvider`-backed implementation.
 */
export function useGiftCards() {
  const client = getCommerceClient() as unknown as GiftCardProvider
  const giftCards = ref<GiftCard[]>([])
  const current = ref<GiftCard | null>(null)
  const balance = ref<number | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchGiftCards(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      giftCards.value = (await client.getGiftCards(params)).items
    } catch (err) {
      error.value = err as Error
      giftCards.value = []
    } finally {
      isLoading.value = false
    }
    return giftCards.value
  }

  async function fetchGiftCardByCode(code: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.getGiftCardByCode(code)
      return current.value
    } catch (err) {
      error.value = err as Error
      current.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function issueGiftCard(input: Parameters<GiftCardProvider['issueGiftCard']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      return await client.issueGiftCard(input)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function redeemGiftCard(code: string, amount: Parameters<GiftCardProvider['redeemGiftCard']>[1], customerId?: string) {
    isLoading.value = true
    error.value = null
    try {
      current.value = await client.redeemGiftCard(code, amount, customerId)
      return current.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function checkBalance(code: string) {
    isLoading.value = true
    error.value = null
    try {
      const b = await client.balance(code)
      balance.value = b ? Number(b.value) : null
      return balance.value
    } catch (err) {
      error.value = err as Error
      balance.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    giftCards,
    current,
    balance,
    isLoading,
    error,
    fetchGiftCards,
    fetchGiftCardByCode,
    issueGiftCard,
    redeemGiftCard,
    checkBalance,
  }
}

export default useGiftCards
