export class SocialError extends Error {
  provider?: string

  constructor(message: string, provider?: string, cause?: any) {
    super(message)
    this.provider = provider
    this.cause = cause
    this.name = 'SocialError'
  }
}

export class RateLimitError extends SocialError {
  retryAfter?: number

  constructor(message: string, provider?: string, retryAfter?: number, cause?: any) {
    super(message, provider, cause)
    this.name = 'RateLimitError'
    this.retryAfter = retryAfter
  }
}
