import { ref } from 'vue'

export default function useContentRequest() {
  const data = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetch = async (_query: any) => {
    loading.value = true
    try {
      data.value = null
    } catch (err) {
      error.value = err as any
    } finally {
      loading.value = false
    }
  }

  async function readItems(_collection: string, _opts?: any) {
    return []
  }

  async function readItem(_collection: string, _id: string | number, _opts?: any) {
    return null
  }

  function getAssetUrl(file: any) {
    return file?.url || ''
  }

  return {
    data,
    loading,
    error,
    fetch,
    readItems,
    readItem,
    getAssetUrl,
  }
}