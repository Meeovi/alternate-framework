import type { H3Event } from 'h3'
import { useRuntimeConfig } from '#imports'

export type TurnstileVerification = {
  success: boolean
  'error-codes'?: string[]
  challenge_ts?: string
  hostname?: string
  action?: string
  cdata?: string
}

/**
 * Checks a Cloudflare Turnstile token with siteverify, using the secret in
 * runtimeConfig.turnstile.secretKey (NUXT_TURNSTILE_SECRET_KEY).
 */
export async function verifyTurnstileToken(token: string, event?: H3Event, signal?: AbortSignal): Promise<TurnstileVerification> {
  const secretKey = (useRuntimeConfig(event) as { turnstile?: { secretKey?: string } }).turnstile?.secretKey || ''
  return await $fetch<TurnstileVerification>('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: `secret=${encodeURIComponent(secretKey)}&response=${encodeURIComponent(token)}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    signal,
  })
}
