export interface APIError {
  status: number
  message: string
  code?: string
  details?: unknown
}