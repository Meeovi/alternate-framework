import { createError, defineEventHandler, getRequestHeaders, readRawBody, setResponseStatus } from 'h3'
import { validateEvent, WebhookVerificationError } from '@polar-sh/sdk/webhooks'
import { polarConfig } from '../utils/polar'

/**
 * POST {webhookPath} — Polar's webhooks (Standard Webhooks signatures).
 * Each verified event is passed to the `polar:webhook` Nitro hook; a
 * listener that throws makes this answer 500, so Polar retries.
 */
export default defineEventHandler(async (event) => {
  const { webhookSecret } = polarConfig(event)
  if (!webhookSecret) throw createError({ statusCode: 503, statusMessage: 'Polar webhooks are not configured' })

  const body = await readRawBody(event, 'utf8')
  if (!body) throw createError({ statusCode: 400, statusMessage: 'Empty body' })

  let payload: ReturnType<typeof validateEvent>
  try {
    payload = validateEvent(body, getRequestHeaders(event) as Record<string, string>, webhookSecret)
  } catch (error) {
    if (error instanceof WebhookVerificationError) {
      throw createError({ statusCode: 403, statusMessage: 'Invalid signature' })
    }
    // Signed by Polar, but a type this SDK version doesn't know: accept it,
    // or Polar retries it forever.
    if (isUnknownEventType(error)) {
      console.warn('[polar] webhook of an unknown type ignored:', (error as { cause?: { message?: string } }).cause?.message)
      setResponseStatus(event, 202)
      return { received: true, handled: false }
    }
    // A known type that doesn't match the SDK's schema: fail, so Polar
    // retries until the SDK is updated instead of the event being lost.
    console.error('[polar] webhook could not be parsed:', (error as Error)?.message ?? error)
    throw createError({ statusCode: 500, statusMessage: 'Webhook could not be parsed' })
  }

  try {
    await useNitroApp().hooks.callHook('polar:webhook', payload, event)
  } catch (error) {
    console.error(`[polar] webhook ${payload.type} listener failed:`, (error as Error)?.message ?? error)
    throw createError({ statusCode: 500, statusMessage: 'Webhook handling failed' })
  }
  setResponseStatus(event, 202)
  return { received: true, handled: true }
})

function isUnknownEventType(error: unknown): boolean {
  const cause = (error as { cause?: { rawMessage?: string, message?: string } })?.cause
  return String(cause?.rawMessage ?? cause?.message ?? '').startsWith('Unknown event type')
}
