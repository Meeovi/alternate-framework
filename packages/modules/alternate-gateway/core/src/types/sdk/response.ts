export interface APIResponse<T = unknown> {
  status: number
  data: T
  error?: string
}