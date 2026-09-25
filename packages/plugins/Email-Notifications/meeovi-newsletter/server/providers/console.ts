import type {
  NewsletterProvider,
  NewsletterProviderContext,
  NewsletterSubscribeInput,
  NewsletterSubscribeResult,
} from '../../runtime/types'

/**
 * No-op development provider. Logs the signup and reports success so the
 * component and endpoint can be exercised without any backend credentials.
 * Also the safe fallback when an unknown provider name is configured.
 */
// Masks all but the first character of the local part so a stray log line
// doesn't put a full email address in plaintext logs — this provider is a
// dev/no-op fallback, but that's no reason to log PII any more than needed.
function maskEmail(email: string): string {
  const [local = '', domain = ''] = email.split('@')
  const maskedLocal = local.length <= 1 ? '*' : `${local[0]}${'*'.repeat(local.length - 1)}`
  return domain ? `${maskedLocal}@${domain}` : maskedLocal
}

export const consoleProvider: NewsletterProvider = {
  name: 'console',

  async subscribe(
    input: NewsletterSubscribeInput,
    ctx: NewsletterProviderContext,
  ): Promise<NewsletterSubscribeResult> {
    console.info(
      `[meeovi-newsletter] (console provider) subscribe: ${maskEmail(input.email)}` +
      (input.source ? ` — source: ${input.source}` : ''),
    )
    return {
      status: ctx.doubleOptIn ? 'pending' : 'subscribed',
      provider: 'console',
    }
  },
}
