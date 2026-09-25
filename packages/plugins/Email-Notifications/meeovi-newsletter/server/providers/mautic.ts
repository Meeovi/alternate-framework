import { createError } from 'h3'
import type {
  NewsletterProvider,
  NewsletterProviderContext,
  NewsletterSubscribeInput,
  NewsletterSubscribeResult,
} from '../../runtime/types'

/**
 * Self-hosted Mautic provider.
 *
 * Mautic's own embeddable form widget (Settings → Forms → a form's "Embed
 * Code") is a snippet of raw HTML + a `mautic-form.js` script that POSTs
 * straight to Mautic from the browser, with its own styling, validation and
 * success/error markup. That would mean dropping this module's own
 * Vuetify-styled `<MeeoviNewsletter>` form (and its honeypot / Turnstile
 * checks) in favour of Mautic's unstyled one wherever it's used.
 *
 * Instead this reproduces that same request server-side: Mautic's
 * `/form/submit` endpoint is the public, unauthenticated target the
 * embedded form itself posts to (that's the whole point of an embeddable
 * form — no API credentials involved), so calling it directly from here
 * keeps the existing component/composable/bot-mitigation untouched and
 * just swaps the backend, the same as the mailchimp/directus providers.
 * Verified live against a real self-hosted instance: it accepts the plain
 * `mauticform[…]` POST with no browser session and creates the contact.
 *
 * Mautic answers success with a 302 to `/form/message`, not JSON — `$fetch`
 * follows that automatically, so a successful submission just resolves.
 * Some Mautic forms (ones with an AJAX-style "Post Submit Action") instead
 * return `{ success, errors }` directly; that shape is checked for too, in
 * case a form here is configured that way.
 *
 * One trade-off: submitting from the server (not a browser session) means
 * Mautic's page-tracking cookie is never set for *this visitor's* browser,
 * so their pre-signup browsing history won't show up against the contact
 * Mautic creates. Segment/campaign actions attached to the form still fire.
 */
export const mauticProvider: NewsletterProvider = {
  name: 'mautic',

  async subscribe(
    input: NewsletterSubscribeInput,
    ctx: NewsletterProviderContext,
  ): Promise<NewsletterSubscribeResult> {
    const {
      baseUrl,
      formId,
      formAlias,
      emailField = 'email',
      firstNameField = 'first_name',
      lastNameField = 'last_name',
    } = ctx.config.mautic

    if (!baseUrl || !formId) {
      throw createError({
        statusCode: 500,
        statusMessage:
          'Mautic provider is not configured. Set NEWSLETTER_MAUTIC_URL and NEWSLETTER_MAUTIC_FORM_ID.',
      })
    }

    const url = `${baseUrl.replace(/\/+$/, '')}/form/submit?formId=${encodeURIComponent(String(formId))}`

    const fields: Record<string, string> = {
      [emailField]: input.email.trim().toLowerCase(),
    }
    if (input.firstName) fields[firstNameField] = input.firstName
    if (input.lastName) fields[lastNameField] = input.lastName
    else if (input.name) fields[firstNameField] = input.name

    // Mautic's embed posts flat `mauticform[<field>]` keys, url-encoded —
    // reproduced verbatim here rather than as a JSON body.
    const body = new URLSearchParams()
    for (const [key, value] of Object.entries(fields)) {
      body.set(`mauticform[${key}]`, value)
    }
    body.set('mauticform[formId]', String(formId))
    body.set('mauticform[formName]', formAlias ?? '')
    body.set('mauticform[return]', '')

    let res: any
    try {
      res = await $fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'X-Requested-With': 'XMLHttpRequest',
        },
        body,
      })
    }
    catch (err: any) {
      const detail = err?.data?.message ?? err?.message ?? 'Mautic request failed'
      console.error('[meeovi-newsletter] mautic provider error:', detail)
      throw createError({ statusCode: 502, statusMessage: 'Could not complete the subscription. Please try again.' })
    }

    // On a validation problem Mautic still answers 200 with a falsy
    // `success` and an `errors` object/array (it's built for its own AJAX
    // form, not a JSON API) — surface that rather than reporting success.
    if (res && typeof res === 'object' && 'success' in res && !res.success) {
      const errors = res.errors
      const detail =
        (typeof errors === 'string' && errors) ||
        (Array.isArray(errors) && errors.join(' ')) ||
        (errors && typeof errors === 'object' && Object.values(errors).flat().join(' ')) ||
        'Mautic rejected the submission'
      console.error('[meeovi-newsletter] mautic provider validation error:', detail)
      throw createError({ statusCode: 502, statusMessage: 'Could not complete the subscription. Please try again.' })
    }

    return { status: ctx.doubleOptIn ? 'pending' : 'subscribed', provider: 'mautic' }
  },
}
