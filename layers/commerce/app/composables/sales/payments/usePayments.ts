// layers/commerce/app/composables/sales/payments/usePayments.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../../utils/client'
import type { PaymentProvider, Payment, PaymentMethod } from '../../../types/payments'

/**
 * Payments composable. Replaces `catalog/payments/gateways.ts` and the
 * payment-script helpers' responsibilities, typed against `PaymentProvider`.
 */
export function usePayments() {
  const client = getCommerceClient() as unknown as PaymentProvider
  const methods = ref<PaymentMethod[]>([])
  const payment = ref<Payment | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchMethods(orderId?: string, storeId?: string) {
    isLoading.value = true
    error.value = null
    try {
      methods.value = await client.getMethods(orderId, storeId)
    } catch (err) {
      error.value = err as Error
      methods.value = []
    } finally {
      isLoading.value = false
    }
    return methods.value
  }

  async function authorize(orderId: string, method: Parameters<PaymentProvider['authorize']>[1], amount?: Parameters<PaymentProvider['authorize']>[2]) {
    isLoading.value = true
    error.value = null
    try {
      payment.value = await client.authorize(orderId, method, amount)
      return payment.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function capture(paymentId: string, amount?: Parameters<PaymentProvider['capture']>[1]) {
    isLoading.value = true
    error.value = null
    try {
      payment.value = await client.capture(paymentId, amount)
      return payment.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function refund(paymentId: string, amount?: Parameters<PaymentProvider['refund']>[1]) {
    isLoading.value = true
    error.value = null
    try {
      payment.value = await client.refund(paymentId, amount)
      return payment.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function voidPayment(paymentId: string) {
    isLoading.value = true
    error.value = null
    try {
      payment.value = await client.void(paymentId)
      return payment.value
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  return {
    methods,
    payment,
    isLoading,
    error,
    fetchMethods,
    authorize,
    capture,
    refund,
    voidPayment,
  }
}

export default usePayments
