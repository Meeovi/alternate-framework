import { createError } from 'h3'

export type MeeoviErrorCode = 'NETWORK' | 'TIMEOUT' | 'BAD_REQUEST' | 'NOT_FOUND' | 'UNKNOWN'

export function mapStatusToMeeoviErrorCode(statusCode: number): MeeoviErrorCode {
  if (statusCode === 404) {
    return 'NOT_FOUND'
  }

  if (statusCode === 408 || statusCode === 504) {
    return 'TIMEOUT'
  }

  if (statusCode === 502 || statusCode === 503) {
    return 'NETWORK'
  }

  if (statusCode >= 400 && statusCode < 500) {
    return 'BAD_REQUEST'
  }

  return 'UNKNOWN'
}

export function createMeeoviHttpError(statusCode: number, message: string) {
  const safeMessage = String(message || 'Request failed').trim() || 'Request failed'

  return createError({
    statusCode,
    statusMessage: safeMessage,
    data: {
      code: mapStatusToMeeoviErrorCode(statusCode),
      message: safeMessage,
    },
  })
}