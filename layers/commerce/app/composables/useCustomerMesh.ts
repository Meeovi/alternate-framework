/**
 * useCustomer Composable - Mesh Bridge
 *
 * Client composable that fetches customer data from server endpoint,
 * which uses meshClient to query Magento.
 */

import { toRefs } from '@vueuse/shared'
import { computed } from 'vue'
import type { Ref } from 'vue'
import { useState, useFetch } from 'nuxt/app'
import { useHandleError } from './useHandleError'
import type { Maybe, SfCustomer } from './models'

interface UseCustomerState {
  data: Maybe<SfCustomer>
  loading: boolean
}

export function useCustomerMesh() {
  const state = useState<UseCustomerState>('customer-mesh', () => ({
    data: null,
    loading: false,
  }))

  const fetchCustomer = async () => {
    state.value.loading = true
    try {
      // Call server endpoint (which uses mesh internally)
      const { data, error } = await useFetch('/api/commerce/customer', {
        method: 'GET',
      })

      if (error.value) {
        throw new Error(error.value.message || 'Failed to fetch customer')
      }

      state.value.data = data.value as SfCustomer

      return computed(() => state.value.data) as unknown as Ref<Maybe<SfCustomer>>
    } catch (error) {
      useHandleError(error)
      state.value.data = null
      throw error
    } finally {
      state.value.loading = false
    }
  }

  return {
    fetchCustomer,
    ...toRefs(state.value),
  }
}

export default useCustomerMesh
