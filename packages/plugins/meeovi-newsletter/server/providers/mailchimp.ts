import { createHash } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { createError } from 'h3'
import type {
  NewsletterProvider,
  NewsletterProviderContext,
  NewsletterSubscribeInput,
  NewsletterSubscribeResult,
} from '../../runtime/types'

/**
 * Mailchimp Marketing API provider.
 *
 * Uses `PUT /lists/{id}/members/{hash}` which upserts the member: on a new
 * address it applies `status_if_new` (respecting double opt-in); on an
 * existing one it leaves the status untouched and just refreshes merge fields.
 */
export const mailchimpProvider: NewsletterProvider = {
  name: 'mailchimp',

  async subscribe(
    input: NewsletterSubscribeInput,
    ctx: NewsletterProviderContext,
  ): Promise<NewsletterSubscribeResult> {
    const { apiKey, serverPrefix, audienceId } = ctx.config.mailchimp

    if (!apiKey || !serverPrefix || !audienceId) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Mailchimp provider is not configured. Set NEWSLETTER_API_KEY, MAILCHIMP_SERVER_PREFIX and MAILCHIMP_AUDIENCE_ID.',
      })
    }

    const email = input.email.trim().toLowerCase()
    const memberHash = createHash('md5').update(email).digest('hex')
    const url = `https://${serverPrefix}.api.mailchimp.com/3.0/lists/${audienceId}/members/${memberHash}`

    const mergeFields: Record<string, string> = {}
    if (input.firstName) mergeFields.FNAME = input.firstName
    if (input.lastName) mergeFields.LNAME = input.lastName
    if (!input.firstName && !input.lastName && input.name) mergeFields.FNAME = input.name

    try {
      const res = await $fetch<{ id?: string, status?: string }>(url, {
        method: 'PUT',
        headers: {
          Authorization: `Basic ${Buffer.from(`anystring:${apiKey}`).toString('base64')}`,
        },
        body: {
          email_address: email,
          status_if_new: ctx.doubleOptIn ? 'pending' : 'subscribed',
          ...(Object.keys(mergeFields).length ? { merge_fields: mergeFields } : {}),
          ...(input.tags?.length ? { tags: input.tags } : {}),
        },
      })

      const status: NewsletterSubscribeResult['status'] =
        res?.status === 'pending' ? 'pending'
          : res?.status === 'subscribed' ? 'subscribed'
            : ctx.doubleOptIn ? 'pending' : 'subscribed'

      return { status, provider: 'mailchimp', id: res?.id }
    }
    catch (err: any) {
      const data = err?.data ?? err?.response?._data
      const title: string = data?.title ?? ''
      const detail: string = data?.detail ?? err?.message ?? 'Mailchimp request failed'

      // Mailchimp returns 400 "Member Exists" for an already-subscribed address.
      if (/member exists/i.test(title)) {
        return { status: 'already_subscribed', provider: 'mailchimp' }
      }
      // A previously-unsubscribed/cleaned member cannot be re-added via PUT.
      if (/forgotten email|compliance state|permanently deleted/i.test(detail)) {
        throw createError({
          statusCode: 409,
          statusMessage: 'This address was previously removed and must re-subscribe from Mailchimp directly.',
        })
      }

      throw createError({
        statusCode: 502,
        statusMessage: title ? `${title}: ${detail}` : detail,
      })
    }
  },
}
