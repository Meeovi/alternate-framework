export type MeeoviErrorCode =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'UNKNOWN'

export interface MeeoviError extends Error {
  code: MeeoviErrorCode
  cause?: unknown
}