import type { NewsletterProvider, NewsletterProviderName } from '../../runtime/types'
import { mailchimpProvider } from './mailchimp'
import { directusProvider } from './directus'
import { consoleProvider } from './console'

/**
 * Registry of bundled newsletter providers.
 *
 * Add a backend by implementing the {@link NewsletterProvider} interface and
 * registering it here (or at runtime via {@link registerNewsletterProvider}).
 */
export const newsletterProviders: Record<string, NewsletterProvider> = {
  [mailchimpProvider.name]: mailchimpProvider,
  [directusProvider.name]: directusProvider,
  [consoleProvider.name]: consoleProvider,
}

/** Register (or override) a provider at runtime, e.g. from a server plugin. */
export function registerNewsletterProvider(provider: NewsletterProvider): void {
  newsletterProviders[provider.name] = provider
}

/** Resolve a provider by name, falling back to the console provider. */
export function resolveNewsletterProvider(name: NewsletterProviderName | undefined | null): NewsletterProvider {
  if (name && newsletterProviders[name]) return newsletterProviders[name]!
  return consoleProvider
}

export { mailchimpProvider, directusProvider, consoleProvider }
export type { NewsletterProvider } from '../../runtime/types'
