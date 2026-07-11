// layers/commerce/app/composables/marketing/useCoupons.ts
import { ref } from 'vue'
import { getCommerceClient } from '../../utils/client'
import type { CouponProvider, CouponRule, AppliedCoupon } from '../../types/coupons'

/**
 * Coupons composable. Replaces `marketing/useCoupons.ts`, typed against
 * `CouponProvider`.
 */
export function useCoupons() {
  const client = getCommerceClient() as unknown as CouponProvider
  const coupons = ref<CouponRule[]>([])
  const applied = ref<AppliedCoupon | null>(null)
  const isLoading = ref(false)
  const error = ref<Error | null>(null)

  async function fetchCoupons(params?: Record<string, any>) {
    isLoading.value = true
    error.value = null
    try {
      coupons.value = (await client.getCoupons(params)).items
    } catch (err) {
      error.value = err as Error
      coupons.value = []
    } finally {
      isLoading.value = false
    }
    return coupons.value
  }

  async function fetchCouponById(id: string) {
    isLoading.value = true
    error.value = null
    try {
      return await client.getCouponById(id)
    } catch (err) {
      error.value = err as Error
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function validateCoupon(code: string, cartTotal?: Parameters<CouponProvider['validateCoupon']>[1], customerId?: string) {
    isLoading.value = true
    error.value = null
    try {
      applied.value = await client.validateCoupon(code, cartTotal, customerId)
      return applied.value
    } catch (err) {
      error.value = err as Error
      applied.value = null
      return null
    } finally {
      isLoading.value = false
    }
  }

  async function generateCodes(ruleId: string, quantity: number, length?: number) {
    isLoading.value = true
    error.value = null
    try {
      return await client.generateCodes(ruleId, quantity, length)
    } catch (err) {
      error.value = err as Error
      return []
    } finally {
      isLoading.value = false
    }
  }

  return {
    coupons,
    applied,
    isLoading,
    error,
    fetchCoupons,
    fetchCouponById,
    validateCoupon,
    generateCodes,
  }
}

export default useCoupons
