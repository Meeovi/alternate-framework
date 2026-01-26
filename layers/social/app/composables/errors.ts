export class SocialError extends Error {
  constructor(message: string, public provider?: string, public cause?: any) {
    super(message)
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
