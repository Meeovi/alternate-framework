import { ref } from 'vue'
import type { SfShippingMethod } from '~/composables/system/models'

export function useShippingSelection(initialValue: SfShippingMethod | null = null) {
  const shippingOptions = ref<SfShippingMethod[]>([])
  const selected = ref<SfShippingMethod | null>(initialValue)
  const loading = ref(false)

  const load = async (params?: {
    address?: Record<string, any>
    items?: Array<Record<string, any>>
  }) => {
    const client = getCommerceClient()
    loading.value = true
    try {
      if (client && typeof client.estimateShippingMethods === 'function' && params) {
        const res = await client.estimateShippingMethods(params)
        shippingOptions.value = res?.methods || []
      } else if (client && typeof client.listShippingMethods === 'function') {
        const res = await client.listShippingMethods(params) as any
        shippingOptions.value = Array.isArray(res) ? res : res?.methods || []
      } else {
        shippingOptions.value = []
      }
    } finally {
      loading.value = false
    }

    return shippingOptions.value
  }

  const select = (method: SfShippingMethod | null) => {
    selected.value = method
    return method
  }

  return {
    shippingOptions,
    selected,
    loading,
    load,
    select,
  }
}

export default useShippingSelection
