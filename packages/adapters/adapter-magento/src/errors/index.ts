import { MeeoviError, MeeoviErrorCode } from '@mframework/core'

export class MagentoError extends Error implements MeeoviError {
  code: MeeoviErrorCode
  cause?: unknown

  constructor(message: string, code: MeeoviErrorCode, cause?: unknown) {
    super(message)
    this.code = code
    this.cause = cause
  }
}

function mapErrorCode(err: any): MeeoviErrorCode {
  if (err?.response?.errors) return 'BAD_REQUEST'
  if (err?.code === 'ETIMEDOUT') return 'TIMEOUT'
  if (err?.code === 'ENOTFOUND' || err?.code === 'ECONNREFUSED') return 'NETWORK'
  return 'UNKNOWN'
}

export async function safeCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err: any) {
    const code = mapErrorCode(err)
    throw new MagentoError('Magento request failed', code, err)
  }
}