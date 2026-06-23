export interface AdapterContext {
  baseUrl: string
  token?: string
  locale?: string
  region?: string
  metadata?: Record<string, unknown>
}