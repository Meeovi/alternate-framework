import { createError } from 'h3'
import type {
  NewsletterProvider,
  NewsletterProviderContext,
  NewsletterSubscribeInput,
  NewsletterSubscribeResult,
} from '../../runtime/types'

/**
 * Directus provider — creates one item in a subscribers collection.
 *
 * This reproduces the behaviour the ecosystem storefronts had before the
 * module existed (a `newsletters` collection with `email` + `status`), but
 * the collection and field names are all configurable.
 */
export const directusProvider: NewsletterProvider = {
  name: 'directus',

  async subscribe(
    input: NewsletterSubscribeInput,
    ctx: NewsletterProviderContext,
  ): Promise<NewsletterSubscribeResult> {
    const {
      url,
      token,
      collection = 'newsletters',
      emailField = 'email',
      statusField = 'status',
      statusValue = 'subscribed',
      // Consent audit trail (for GDPR-style "when/where did this address
      // opt in" record-keeping). The `newsletters` collection needs these
      // columns — rename via these options if yours uses different ones,
      // or set to `null` to skip recording consent entirely.
      consentAtField = 'consent_at',
      consentIpField = 'consent_ip',
    } = ctx.config.directus

    if (!url) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Directus provider is not configured. Set DIRECTUS_URL (or meeoviNewsletter.directus.url).',
      })
    }

    const endpoint = `${url.replace(/\/+$/, '')}/items/${collection}`
    const body: Record<string, unknown> = {
      [emailField]: input.email.trim().toLowerCase(),
      date_created: new Date().toISOString(),
    }
    if (statusField) body[statusField] = statusValue
    if (input.name) body.name = input.name
    if (input.source) body.source = input.source
    if (consentAtField) body[consentAtField] = ctx.consentAt
    if (consentIpField && ctx.requestIp) body[consentIpField] = ctx.requestIp

    try {
      const res = await $fetch<{ data?: { id?: string | number } }>(endpoint, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body,
      })
      const id = res?.data?.id
      return {
        status: ctx.doubleOptIn ? 'pending' : 'subscribed',
        provider: 'directus',
        id: id != null ? String(id) : undefined,
      }
    }
    catch (err: any) {
      const message: string =
        err?.data?.errors?.[0]?.message ?? err?.data?.message ?? err?.message ?? 'Directus request failed'

      // Unique-constraint violation on the email column → already on the list.
      if (/unique|duplicate|has to be unique/i.test(message)) {
        return { status: 'already_subscribed', provider: 'directus' }
      }

      // Don't forward Directus's raw error (collection/field/schema
      // details) to the client — log it server-side instead.
      console.error('[meeovi-newsletter] directus provider error:', message)
      throw createError({ statusCode: 502, statusMessage: 'Could not save your subscription. Please try again.' })
    }
  },
}
