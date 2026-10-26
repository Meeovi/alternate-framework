import type { H3Event } from 'h3'
import type { validateEvent } from '@polar-sh/sdk/webhooks'

/** A verified Polar webhook event (`order.paid`, `subscription.active`, …). */
export type PolarWebhookPayload = ReturnType<typeof validateEvent>
export type PolarWebhookType = PolarWebhookPayload['type']

export interface MeeoviPolarModuleOptions {
  /** Set false to register nothing. Default true. */
  enabled?: boolean
  /** Polar organization access token (server only). */
  accessToken?: string
  /** 'sandbox' (default) or 'production'. */
  server?: 'sandbox' | 'production'
  /** Webhook signing secret from Polar's webhook settings (server only). */
  webhookSecret?: string
  /**
   * Where Polar sends the buyer after paying. Relative URLs are resolved
   * against the request's origin; `{CHECKOUT_ID}` is filled in by Polar.
   */
  successUrl?: string
  /** The back button in checkout and the customer portal. Default: the site's root. */
  returnUrl?: string
  /**
   * Products that may be checked out, by slug: `{ 'pro-monthly': '<product id>' }`.
   * Empty (default): any product id of the organization.
   */
  products?: Record<string, string>
  /** Prefix for the module's API routes. Default '/api/polar'. */
  apiBase?: string
  /** The webhook route to give Polar. Default '/webhook/polar'. */
  webhookPath?: string
  /** better-auth's session route, used to find the signed-in user. */
  sessionEndpoint?: string
}

/** The checkout status the public status route returns. */
export interface PolarCheckoutStatus {
  id: string
  status: string
  product: { name: string, description: string | null } | null
}

/** A product as the products route returns it. */
export interface PolarProductSummary {
  id: string
  name: string
  description: string | null
  isRecurring: boolean
  prices: { id: string, amountType: string, priceAmount: number | null, priceCurrency: string | null, recurringInterval: string | null }[]
}

declare module 'nitropack/types' {
  interface NitroRuntimeHooks {
    /**
     * A verified Polar webhook event. Throw to answer 500, so Polar retries
     * the delivery; listeners must therefore be idempotent (use `payload`'s
     * object id, e.g. the order id).
     */
    'polar:webhook': (payload: PolarWebhookPayload, event: H3Event) => void | Promise<void>
  }
}
