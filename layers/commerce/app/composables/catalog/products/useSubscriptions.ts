// layers/commerce/app/composables/catalog/products/useSubscriptions.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { SubscriptionProvider } from '../../../types/subscriptions'
import type { Subscription, SubscriptionPlan } from '../../../types/products'

/**
 * Subscription composable. Replaces the old `useSubscriptions.ts` thin wrapper,
 * now fully typed against the `SubscriptionProvider` contract.
 */
export function useSubscriptions() {
  const client = getCommerceClient() as unknown as SubscriptionProvider
  const subscriptions = ref<Subscription[]>([])
  const plans = ref<SubscriptionPlan[]>([])
  const billingHistory = ref<Awaited<ReturnType<SubscriptionProvider['getBillingHistory']>>>([])
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchSubscriptions(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      subscriptions.value = (await client.getSubscriptions(params)).items
    } catch (err) {
      error.value = err as Error
      subscriptions.value = []
    } finally {
      isLoading.value = false
    }
    return subscriptions.value
  }

  async function fetchSubscriptionById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.getSubscriptionById(id)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPlans(productId?: string) {
    isLoading.value = true
    error.value = null
    try {
      plans.value = await client.getPlans(productId)
    } catch (err) {
      error.value = err as Error
      plans.value = []
    } finally {
      isLoading.value = false
    }
    return plans.value
  }

  async function subscribe(payload: Parameters<SubscriptionProvider['subscribe']>[0]) {
    isLoading.value = true
    error.value = null
    try {
      return await client.subscribe(payload)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function updateSubscription(id: string, input: Parameters<SubscriptionProvider['updateSubscription']>[1]) {
    isLoading.value = true
    error.value = null
    try {
      return await client.updateSubscription(id, input)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function cancelSubscription(id: string, reason?: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.cancelSubscription(id, reason)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function pauseSubscription(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.pauseSubscription(id)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function resumeSubscription(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.resumeSubscription(id)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function fetchBillingHistory(subscriptionId: string) {
    isLoading.value = true
    error.value = null
    try {
      billingHistory.value = await client.getBillingHistory(subscriptionId)
    } catch (err) {
      error.value = err as Error
      billingHistory.value = []
    } finally {
      isLoading.value = false
    }
    return billingHistory.value
  }

  return {
    subscriptions,
    plans,
    billingHistory,
    isLoading,
    error,
    fetchSubscriptions,
    fetchSubscriptionById,
    fetchPlans,
    subscribe,
    updateSubscription,
    cancelSubscription,
    pauseSubscription,
    resumeSubscription,
    fetchBillingHistory,
  }
}

export default useSubscriptions
