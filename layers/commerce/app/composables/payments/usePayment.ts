import { ref } from 'vue'
import { loadStripe } from '@stripe/stripe-js'
import type { Stripe, StripeElements } from '@stripe/stripe-js'

const stripeInstance = ref<Stripe | null>(null)
const elementsInstance = ref<StripeElements | null>(null)

/**
 * Backend-agnostic payment provider composable.
 *
 * Wraps Stripe.js initialization (publishable key) so that UI components
 * don't import `@stripe/stripe-js` directly or read `runtimeConfig` for the
 * publishable key. The key itself is public and must live in `runtimeConfig`,
 * but the `loadStripe` + Elements factory is centralised here.
 *
 * Future payment providers (PayPal, etc.) can be added by extending the
 * `usePayment()` return shape behind feature detection.
 */
export function usePayment() {
  const publishableKey = useRuntimeConfig().public.stripePublishableKey as string | undefined

  const loadProvider = async (): Promise<Stripe | null> => {
    if (stripeInstance.value) {
      return stripeInstance.value
    }

    if (!publishableKey) {
      console.warn('[usePayment] stripePublishableKey is not configured')
      return null
    }

    stripeInstance.value = await loadStripe(publishableKey)
    return stripeInstance.value
  }

  const createElements = async (
    clientSecret: string,
    appearance?: Record<string, unknown>,
  ): Promise<StripeElements | null> => {
    const stripe = await loadProvider()
    if (!stripe || !clientSecret) return null

    elementsInstance.value = stripe.elements({
      clientSecret,
      appearance: appearance ?? { theme: 'stripe' as const },
    })

    return elementsInstance.value
  }

  const confirmPayment = async (
    elements: StripeElements,
    confirmParams?: Record<string, any>,
  ): Promise<{ error?: { message?: string }; paymentIntent?: any }> => {
    const stripe = stripeInstance.value
    if (!stripe) {
      return { error: { message: 'Stripe is not initialized' } }
    }

    return stripe.confirmPayment({
      elements,
      confirmParams: confirmParams as any,
    })
  }

  const createCheckoutSession = async (items: any[], options: Record<string, any> = {}): Promise<Record<string, any>> => {
    try {
      const response = await $fetch('/api/payment/stripe/checkout-session', {
        method: 'POST',
        body: { items, ...options },
      })
      return response as Record<string, any>
    } catch (error: any) {
      throw new Error(error?.data?.message || 'Failed to create checkout session')
    }
  }

  return {
    loadProvider,
    createElements,
    confirmPayment,
    createCheckoutSession,
    isLoaded: () => stripeInstance.value !== null,
  }
}

export default usePayment
