export interface ApiFormConfig {
  name: string
  schema: Record<string, any>
  uiSchema?: Record<string, any>
  defaults?: Record<string, any>
  submitEndpoint?: string
  submitMethod?: 'POST' | 'PUT' | 'PATCH'
}

export interface MeeoviFormsRuntimeConfig {
  apiBase: string
  apis: ApiFormConfig[]
}

export interface DirectusField {
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
    // Directus's own marker for relational columns (m2o/o2m/m2m/m2a/
    // translations/files) — see utils/directusFields.ts's isRelationalField.
    special?: string[]
  }
}

export interface DirectusFormOptions {
  collection: string
  modelValue?: Record<string, unknown>
  fields?: DirectusField[]
  submitLabel?: string
  clearOnSuccess?: boolean
  enableTurnstile?: boolean | null
}
