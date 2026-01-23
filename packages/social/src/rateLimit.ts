import { RateLimitError } from "./errors";

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

const providerLimits = new Map<string, RateLimitConfig>()
const providerUsage = new Map<string, { count: number; resetAt: number }>()

export function setRateLimit(provider: string, config: RateLimitConfig) {
  providerLimits.set(provider, config)
}

export function checkRateLimit(provider: string) {
  const limit = providerLimits.get(provider)
  if (!limit) return

  const now = Date.now()
  const usage = providerUsage.get(provider) || {
    count: 0,
    resetAt: now + limit.windowMs
  }

  if (now > usage.resetAt) {
    usage.count = 0
    usage.resetAt = now + limit.windowMs
  }

  usage.count++

  providerUsage.set(provider, usage)

  if (usage.count > limit.maxRequests) {
    throw new RateLimitError(
      `Meeovi internal rate limit exceeded for provider "${provider}"`,
      provider,
      Math.ceil((usage.resetAt - now) / 1000)
    )
  }
}
