import { defineEventHandler, readBody, createError, setResponseStatus, getRequestIP } from 'h3'
import { z } from 'zod'
import { resolveNewsletterProvider } from '../../providers'
import type {
  NewsletterPublicRuntimeConfig,
  NewsletterRuntimeConfig,
  NewsletterSubscribeResponse,
} from '../../../runtime/types'

const bodySchema = z.object({
  email: z.email().max(320),
  name: z.string().trim().max(200).optional(),
  firstName: z.string().trim().max(100).optional(),
  lastName: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).optional(),
  source: z.string().trim().max(200).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  honeypot: z.string().max(200).optional(),
  turnstileToken: z.string().max(4096).optional(),
})

export default defineEventHandler(async (event): Promise<NewsletterSubscribeResponse> => {
  const parsed = bodySchema.safeParse(await readBody(event))
  if (!parsed.success) {
    throw createError({
      statusCode: 422,
      statusMessage: 'Invalid subscription details',
      data: { issues: parsed.error.issues },
    })
  }

  const { honeypot, turnstileToken, ...input } = parsed.data

  const runtimeConfig = useRuntimeConfig(event)
  const priv = (runtimeConfig.meeoviNewsletter ?? {}) as NewsletterRuntimeConfig
  const pub = (runtimeConfig.public?.meeoviNewsletter ?? {}) as NewsletterPublicRuntimeConfig

  // Honeypot tripped — a real visitor never fills this field. Report the
  // same success shape a genuine subscriber would get (so a bot can't tell
  // it was caught) without actually calling the provider.
  if (honeypot) {
    setResponseStatus(event, 201)
    return { ok: true, status: 'subscribed', provider: priv.provider ?? pub.provider }
  }

  if (priv.turnstile?.enabled) {
    if (!turnstileToken) {
      throw createError({ statusCode: 422, statusMessage: 'Verification required' })
    }
    // Calls Cloudflare's siteverify endpoint directly rather than depending
    // on @nuxtjs/turnstile's server auto-import (that module's auto-imports
    // only exist when it is itself registered — the module.ts option that
    // turns this on is meant to auto-detect that case via its site key, but
    // verification shouldn't hard-depend on the other module's internals).
    // Reuses the same `runtimeConfig.turnstile.secretKey` @nuxtjs/turnstile
    // itself populates, so no separate credential needs configuring.
    const secretKey = (runtimeConfig as any).turnstile?.secretKey
    if (!secretKey) {
      throw createError({ statusCode: 500, statusMessage: 'Turnstile is enabled but not configured' })
    }
    const verification = await $fetch<{ success: boolean }>(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        body: new URLSearchParams({
          secret: secretKey,
          response: turnstileToken,
          remoteip: getRequestIP(event, { xForwardedFor: true }) || '',
        }),
      },
    ).catch(() => ({ success: false }))
    if (!verification.success) {
      throw createError({ statusCode: 422, statusMessage: 'Verification failed — please try again' })
    }
  }

  const provider = resolveNewsletterProvider(priv.provider ?? pub.provider)

  let result
  try {
    result = await provider.subscribe(input, {
      doubleOptIn: priv.doubleOptIn !== false,
      config: priv,
      requestIp: getRequestIP(event, { xForwardedFor: true }),
      consentAt: new Date().toISOString(),
    })
  }
  catch (err: any) {
    // Providers throw H3 errors (via createError) for conditions the
    // caller should see (e.g. "not configured"); anything else is an
    // unexpected upstream failure — log the detail server-side and don't
    // forward provider/library internals to the client.
    if (err?.statusCode) throw err
    console.error('[meeovi-newsletter] provider error:', err)
    throw createError({ statusCode: 502, statusMessage: 'Could not complete the subscription. Please try again.' })
  }

  if (result.status === 'already_subscribed') setResponseStatus(event, 200)
  else setResponseStatus(event, 201)

  return { ok: true, ...result }
})
