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

      throw createError({ statusCode: 502, statusMessage: message })
    }
  },
}
