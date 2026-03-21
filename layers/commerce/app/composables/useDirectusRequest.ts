// Local stub for Directus request composable
import { ref } from 'vue'

export default function useDirectusRequest() {
  // Stub implementation - parent app should provide actual Directus API integration
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetch = async (query: any) => {
    loading.value = true
    try {
      // Stub: return empty data
      data.value = null
    } catch (err) {
      error.value = err as any
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    loading,
    error,
    fetch
  }
}
