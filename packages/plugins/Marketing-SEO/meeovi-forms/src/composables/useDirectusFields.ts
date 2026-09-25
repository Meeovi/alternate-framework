import { ref } from 'vue'
import type { DirectusField } from '../types.js'

export type { DirectusField }

function normalizeFields(input: unknown): DirectusField[] {
  const list: unknown[] = Array.isArray(input)
    ? input
    : (Array.isArray((input as any)?.data) ? (input as any).data : [])

  return list.filter((field: unknown) => Boolean((field as DirectusField)?.field)) as DirectusField[]
}

export function useDirectusFields() {
  const { $directus, $readFieldsByCollection } = useNuxtApp() as any

  const fields = ref<DirectusField[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadFields = async (collection: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $directus.request($readFieldsByCollection(collection))
      fields.value = normalizeFields(response)
      return fields.value
    } catch (err: any) {
      fields.value = []
      error.value = err?.message || 'Unable to load dynamic schema.'
      return []
    } finally {
      loading.value = false
    }
  }

  return {
    fields,
    loading,
    error,
    loadFields,
  }
}

export default useDirectusFields
