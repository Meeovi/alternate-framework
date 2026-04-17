/**
 * useCart Composable - Mesh Bridge
 *
 * Client composable that manages cart through server endpoints,
 * which use meshClient to query Commerce.
 */

import { toRefs } from '@vueuse/shared'
import { ref } from 'vue'
import { useState, useFetch } from 'nuxt/app'
import { useHandleError } from '../useHandleError'
import type { Maybe, SfCart } from '../models'

interface UseCartState {
  data: Maybe<SfCart>
  loading: boolean
}

export function useCartMesh() {
  const state = useState<UseCartState>('cart-mesh', () => ({
    data: null,
    loading: false,
  }))

  const fetchCart = async (cartId: string) => {
    state.value.loading = true
    try {
      const { data, error } = await useFetch(`/api/commerce/cart?cartId=${cartId}`, {
        method: 'GET',
      })

      if (error.value) {
        throw new Error(error.value.message || 'Failed to fetch cart')
      }

      state.value.data = data.value as SfCart

      return ref(state.value.data)
    } catch (error) {
      useHandleError(error)
      state.value.data = null
      throw error
    } finally {
      state.value.loading = false
    }
  }

  const createCart = async () => {
    try {
      // In Commerce, cart creation is typically done server-side
      // We can call an endpoint that creates and returns the cart
      const { data, error } = await useFetch('/api/commerce/cart/create', {
        method: 'POST',
      })

      if (error.value) {
        throw new Error('Failed to create cart')
      }

      return (data.value as any)?.id
    } catch (error) {
      useHandleError(error)
      throw error
    }
  }

  return {
    fetchCart,
    createCart,
    ...toRefs(state.value),
  }
}

export default useCartMesh
