// composables/useCheckout.ts
import { usePayment } from '../../payments/usePayment'

export const useCheckout = () => {
  const { createCheckoutSession: createSession } = usePayment()

  const createCheckoutSession = async (items: any[], options: any = {}) => {
    return createSession(items, options)
  }

  return {
    createCheckoutSession
  }
}
