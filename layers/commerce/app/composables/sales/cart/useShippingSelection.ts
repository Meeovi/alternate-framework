import { ref } from '#imports'

export function useShippingSelection(initialValue = null) {
  const shippingOptions = ref([])
  const selected = ref(initialValue)
  const loading = ref(false)

  const load = async () => {
    // No-op stub: real implementation should fetch shipping methods from provider
    loading.value = true
    try {
      // placeholder empty list
      shippingOptions.value = []
    } finally {
      loading.value = false
    }
  }

  return { shippingOptions, selected, loading, load }
}

export default useShippingSelection
