import { defineStore } from 'pinia';
import type { Address } from '../types/commerce.type'

export const useCheckoutStore = defineStore('checkout', () => {
  const step = ref<'address' | 'shipping' | 'payment' | 'review'>('address')
  const address = ref<Address | null>(null)
  const shippingMethod = ref<string | null>(null)
  const paymentMethod = ref<string | null>(null)

  return { step, address, shippingMethod, paymentMethod }
})
