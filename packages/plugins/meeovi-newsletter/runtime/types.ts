/**
 * Shared types for @mframework/meeovi-newsletter.
 *
 * Safe to import from both client (component / composable) and server
 * (Nitro handler / providers) code — no runtime dependencies.
 */

/** Identifier of a bundled backend provider, or a custom string for user-registered providers. */
export type NewsletterProviderName = 'mailchimp' | 'directus' | 'console' | (string & {})

/** Payload accepted by the `/api/newsletter/subscribe` endpoint and by every provider. */
export interface NewsletterSubscribeInput {
  /** Subscriber email address. Required. */
  email: string
  /** Full name, when a single field is collected. */
  name?: string
  /** First name, mapped to provider merge fields where supported. */
  firstName?: string
  /** Last name, mapped to provider merge fields where supported. */
  lastName?: string
  /** Free-form tags / interests forwarded to the provider when supported. */
  tags?: string[]
  /** Where the signup happened (e.g. `footer`, `checkout`) — stored as metadata. */
  source?: string
  /** Arbitrary extra fields forwarded to providers that accept metadata. */
  metadata?: Record<string, unknown>
}

/** Normalised outcome every provider returns. */
export interface NewsletterSubscribeResult {
  /**
   * - `subscribed` — the address is now an active subscriber.
   * - `pending` — a confirmation email was sent (double opt-in).
   * - `already_subscribed` — the address was already on the list; treated as success.
   */
  status: 'subscribed' | 'pending' | 'already_subscribed'
  /** Name of the provider that handled the request. */
  provider: NewsletterProviderName
  /** Provider-side identifier for the subscriber, when available. */
  id?: string
}

/** Response body of the subscribe endpoint. */
export interface NewsletterSubscribeResponse extends NewsletterSubscribeResult {
  ok: true
}

/** Resolved, server-only configuration handed to a provider at call time. */
export interface NewsletterProviderContext {
  /** `true` when providers should create pending (unconfirmed) subscribers. */
  doubleOptIn: boolean
  /** Provider-specific credentials block from `runtimeConfig.meeoviNewsletter`. */
  config: NewsletterRuntimeConfig
}

/** A pluggable newsletter backend. */
export interface NewsletterProvider {
  /** Unique provider name, matched against `NEWSLETTER_PROVIDER` / module options. */
  name: NewsletterProviderName
  /** Perform the subscription. Throw an `h3` error (via `createError`) on failure. */
  subscribe: (input: NewsletterSubscribeInput, ctx: NewsletterProviderContext) => Promise<NewsletterSubscribeResult>
}

export interface MailchimpProviderOptions {
  apiKey?: string
  /** Data-center prefix, e.g. `us21` (the part after the dash in the API key). */
  serverPrefix?: string
  /** Target audience / list id. */
  audienceId?: string
}

export interface DirectusProviderOptions {
  /** Directus base URL. Defaults to `DIRECTUS_URL`. */
  url?: string
  /** Static token used to authenticate the write. Defaults to `NUXTUS_DIRECTUS_STATIC_TOKEN`. */
  token?: string
  /** Collection that stores subscribers. */
  collection?: string
  /** Field on the collection that holds the email address. */
  emailField?: string
  /** Field on the collection that holds the subscription status. */
  statusField?: string
  /** Value written to `statusField` on subscribe. */
  statusValue?: string
}

/** Private (server-only) runtime config, published under `runtimeConfig.meeoviNewsletter`. */
export interface NewsletterRuntimeConfig {
  provider: NewsletterProviderName
  doubleOptIn: boolean
  mailchimp: MailchimpProviderOptions
  directus: DirectusProviderOptions
}

/** Public runtime config, published under `runtimeConfig.public.meeoviNewsletter`. */
export interface NewsletterPublicRuntimeConfig {
  /** Base path for the module's endpoints. */
  apiBase: string
  /** Active provider name — exposed so UIs can adapt copy if needed. */
  provider: NewsletterProviderName
  /** UI defaults for the shipped component. */
  ui: NewsletterUiOptions
}

export interface NewsletterUiOptions {
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
  successMessage?: string
}

export interface MeeoviNewsletterModuleOptions {
  /** Backend provider. Defaults to `NEWSLETTER_PROVIDER` env, then `directus`. */
  provider?: NewsletterProviderName
  /** Base path for the subscribe endpoint. Default `/api/newsletter`. */
  apiBase?: string
  /** Create unconfirmed subscribers and send a confirmation email. Default `true`. */
  doubleOptIn?: boolean
  /** Mailchimp credentials (used when `provider === 'mailchimp'`). */
  mailchimp?: MailchimpProviderOptions
  /** Directus target (used when `provider === 'directus'`). */
  directus?: DirectusProviderOptions
  /** Default copy for the `<MeeoviNewsletter>` component. */
  ui?: NewsletterUiOptions
}
