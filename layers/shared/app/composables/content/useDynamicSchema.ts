import { ref } from 'vue'

export type DynamicContentField = {
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
  }
}

function normalizeFields(input: unknown): DynamicContentField[] {
  const list: unknown[] = Array.isArray(input)
    ? input
    : (Array.isArray((input as any)?.data) ? (input as any).data : [])

  return list.filter((field: unknown) => Boolean((field as DynamicContentField)?.field)) as DynamicContentField[]
}

export function useDynamicSchema() {
  const { $sdk } = useNuxtApp()

  const fields = ref<DynamicContentField[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadSchema = async (collection: string) => {
    loading.value = true
    error.value = null

    try {
      const response = await $sdk.content.readFieldsByCollection(collection)
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
    loadSchema,
  }
}

export default useDynamicSchema
