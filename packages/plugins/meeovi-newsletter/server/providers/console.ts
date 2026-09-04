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
export const consoleProvider: NewsletterProvider = {
  name: 'console',

  async subscribe(
    input: NewsletterSubscribeInput,
    ctx: NewsletterProviderContext,
  ): Promise<NewsletterSubscribeResult> {
    console.info(
      `[meeovi-newsletter] (console provider) subscribe: ${input.email}` +
      (input.source ? ` — source: ${input.source}` : ''),
    )
    return {
      status: ctx.doubleOptIn ? 'pending' : 'subscribed',
      provider: 'console',
    }
  },
}
