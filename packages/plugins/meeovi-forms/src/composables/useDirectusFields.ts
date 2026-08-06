import { ref } from 'vue'

export type DirectusField = {
  field?: string
  type?: string
  name?: string
  schema?: {
    data_type?: string
    default_value?: unknown
    is_nullable?: boolean
    foreign_key_table?: string
  }
  meta?: {
    interface?: string
    note?: string
    width?: string
    hidden?: boolean
    required?: boolean
    readonly?: boolean
    options?: Record<string, unknown>
    validation?: Record<string, any>
    validation_message?: string
  }
}

function normalizeFields(input: unknown): DirectusField[] {
  const list: unknown[] = Array.isArray(input)
    ? input
    : (Array.isArray((input as any)?.data) ? (input as any).data : [])

  return list.filter((field: unknown) => Boolean((field as DirectusField)?.field)) as DirectusField[]
}

export function useDirectusFields() {
  const { $directus, $readFieldsByCollection } = useNuxtApp()

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
