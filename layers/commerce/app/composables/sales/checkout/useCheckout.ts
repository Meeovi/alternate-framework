// composables/useCheckout.ts
export const useCheckout = () => {
  const createCheckoutSession = async (items: any[], options: any = {}) => {
    try {
      const response = await $fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        body: {
          items,
          ...options
        }
      })
      return response
    } catch (error: any) {
      throw new Error(error.data?.message || 'Failed to create checkout session')
    }
  }

  return {
    createCheckoutSession
  }
}