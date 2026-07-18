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
