import { ref } from '#imports'

export function useCommerceMutation(document: unknown) {
  const data = ref<any>(null)
  const error = ref<any>(null)
  const loading = ref(false)

  const mutate = async (variables?: Record<string, unknown>) => {
    loading.value = true
    error.value = null
    try {
      const nuxtApp = useNuxtApp() as any
      const client = nuxtApp?.$commerceClient
      if (client && typeof client.mutate === 'function') {
        const result = await client.mutate({ document, variables: variables ?? {} })
        data.value = result?.data ?? result ?? null
      } else {
        data.value = null
      }
      return data.value
    } catch (err) {
      error.value = err
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    data,
    error,
    loading,
    mutate,
  }
}

export default useCommerceMutation
