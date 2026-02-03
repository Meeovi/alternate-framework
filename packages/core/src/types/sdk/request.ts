export interface RequestOptions {
  params?: Record<string, string | number>
  query?: Record<string, string | number | boolean>
  body?: unknown
  headers?: Record<string, string>
}