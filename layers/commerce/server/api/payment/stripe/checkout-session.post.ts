// server/api/payment/stripe/checkout-session.post.ts
import Stripe from 'stripe'
import Joi from 'joi'
import { createDirectus, rest, staticToken, readItem } from '@directus/sdk'
import { stripe } from '../../../utils/stripe'
import { getAuthSession } from '#auth/server/utils/sessions'
import { getRate } from '../../../utils/shippo'

// A privileged client used only to look up each item's authoritative price —
// never trust a client-supplied `item.price`, since that would let a caller
// dictate what they get charged.
const directus = createDirectus(process.env.DIRECTUS_URL!)
  .with(rest())
  .with(staticToken(process.env.DIRECTUS_STATIC_TOKEN!))

// 8 random letters for the integration_identifier suffix (per stripe skill).
const randomSuffix = Array.from({ length: 8 }, () =>
  'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
).join('')

// Validation schemas
// Note: `name`, `description`, `price`, and `images` are intentionally NOT
// trusted from the client when `priceId` is absent — see the lookup below.
// They're accepted here only so older callers don't fail validation; the
// values are discarded in favor of the authoritative Directus product record.
const itemSchema = Joi.object({
  id: Joi.string().required(),
  priceId: Joi.string().optional(),
  name: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().positive().optional(),
  quantity: Joi.number().integer().min(1).max(100).required(),
  images: Joi.array().items(Joi.string().uri()).max(8).optional(),
  metadata: Joi.object().optional()
})

const requestSchema = Joi.object({
  items: Joi.array().items(itemSchema).min(1).max(100).required(),
  mode: Joi.string().valid('payment', 'subscription', 'setup').default('payment'),
  currency: Joi.string().length(3).lowercase().default('usd'),
  customerEmail: Joi.string().email().optional(),
  customerId: Joi.string().optional(),
  accountId: Joi.string().optional(),
  successUrl: Joi.string().uri().optional(),
  cancelUrl: Joi.string().uri().optional(),
  allowPromotionCodes: Joi.boolean().default(false),
  collectShippingAddress: Joi.boolean().default(false),
  collectBillingAddress: Joi.boolean().default(false),
  taxRates: Joi.array().items(Joi.string()).optional(),
  discounts: Joi.array().items(
    Joi.object({
      coupon: Joi.string().optional(),
      promotion_code: Joi.string().optional()
    })
  ).optional(),
  metadata: Joi.object().optional(),
  locale: Joi.string().valid(
    'auto', 'bg', 'cs', 'da', 'de', 'el', 'en', 'en-GB', 'es', 'es-419',
    'et', 'fi', 'fil', 'fr', 'fr-CA', 'hr', 'hu', 'id', 'it', 'ja', 'ko',
    'lt', 'lv', 'ms', 'mt', 'nb', 'nl', 'pl', 'pt', 'pt-BR', 'ro', 'ru',
    'sk', 'sl', 'sv', 'th', 'tr', 'vi', 'zh', 'zh-HK', 'zh-TW'
  ).default('auto'),
  subscriptionData: Joi.object({
    trial_period_days: Joi.number().integer().min(0).max(730).optional(),
    default_tax_rates: Joi.array().items(Joi.string()).optional(),
    metadata: Joi.object().optional()
  }).optional(),
  shippingOptions: Joi.array().items(
    Joi.object({
      shipping_rate: Joi.string().required()
    })
  ).optional(),
  // An opaque Shippo rate id selected during checkout — the amount is
  // re-fetched from Shippo below and is never taken from the client.
  shippoRateId: Joi.string().optional()
})

interface CartItem {
  id: string
  priceId ? : string
  name ? : string
  description ? : string
  price ? : number
  quantity: number
  images ? : string[]
  metadata ? : Record < string,
  string >
}

interface CheckoutRequest {
  items: CartItem[]
  mode ? : 'payment' | 'subscription' | 'setup'
  currency ? : string
  customerEmail ? : string
  customerId ? : string
  accountId ? : string
  successUrl ? : string
  cancelUrl ? : string
  allowPromotionCodes ? : boolean
  collectShippingAddress ? : boolean
  collectBillingAddress ? : boolean
  taxRates ? : string[]
  discounts ? : Array < {
      coupon ? : string;promotion_code ? : string
    } >
    metadata ? : Record < string,
  string >
  locale ? : string
  subscriptionData ? : {
    trial_period_days ? : number
    default_tax_rates ? : string[]
    metadata ? : Record < string,
    string >
  }
  shippingOptions ? : Array < {
    shipping_rate: string
  } >
  shippoRateId ? : string
}

export default defineEventHandler(async (event) => {
  try {
    // Read and validate request body
    const body = await readBody(event)
    const {
      error,
      value
    } = requestSchema.validate(body, {
      abortEarly: false,
      allowUnknown: false
    })

    if (error) {
      const errorMessages = error.details.map(detail => detail.message).join(', ')
      throw createError({
        statusCode: 400,
        statusMessage: `Validation error: ${errorMessages}`
      })
    }

    // Resolve the buyer from the request's own session — never from a
    // client-supplied field — so the webhook can attribute the resulting
    // order to the right account. Guests (no session) can still check out;
    // their order just won't have a buyer_id to look up later.
    const authSession = await getAuthSession(event).catch(() => null)
    const buyerId = authSession?.user?.id as string | undefined

    const {
      items,
      mode,
      currency,
      customerEmail,
      customerId,
      accountId,
      successUrl,
      cancelUrl,
      allowPromotionCodes,
      collectShippingAddress,
      collectBillingAddress,
      taxRates,
      discounts,
      metadata,
      locale,
      subscriptionData,
      shippingOptions,
      shippoRateId
    }: CheckoutRequest = value

    // Transform items for Stripe.
    // Per Stripe docs, detect each price's type so we can pick the right
    // checkout mode (subscription vs payment) and flag recurring line items.
    // Ensure we have a guaranteed currency string
    const activeCurrency = currency || 'usd';

    // 1. Explicitly type our temporary processing array
    interface TempLineItem {
      quantity: number;
      price ? : string;
      price_data ? : Stripe.Checkout.SessionCreateParams.LineItem.PriceData;
      tax_rates ? : string[];
      _mode: 'payment' | 'subscription'; // Our helper flag
    }

    const tempLineItems: TempLineItem[] = await Promise.all(
      items.map(async (item) => {
        const lineItem: TempLineItem = {
          quantity: item.quantity,
          _mode: 'payment',
        }

        if (item.priceId) {
          lineItem.price = item.priceId
          const price = await stripe.prices.retrieve(item.priceId)
          lineItem._mode = price.type === 'recurring' ? 'subscription' : 'payment'

          if (taxRates && taxRates.length > 0) {
            lineItem.tax_rates = taxRates
          }
        } else {
          // Never trust item.price/name/description/images from the client —
          // resolve the real product from Directus and price it from there.
          // Note: `description` is intentionally not requested — the static
          // token used here does not have field-level read access to it on
          // `products`, and it's not essential to computing a safe price.
          const product = await directus.request(
            readItem('products', item.id, {
              fields: ['id', 'name', 'price', 'image.filename_disk']
            })
          ).catch(() => null) as {
            id: string
            name?: string
            price?: number | string
            image?: { filename_disk?: string }
          } | null

          // Directus serializes decimal columns as strings, so this must be
          // coerced rather than checked with typeof — otherwise every
          // correctly-priced product gets rejected as "unpriced".
          const productPrice = Number(product?.price)

          if (!product || !Number.isFinite(productPrice)) {
            throw createError({
              statusCode: 400,
              statusMessage: `Unknown or unpriced product: ${item.id}`
            })
          }

          const productImageUrl = product.image?.filename_disk
            ? `${process.env.DIRECTUS_URL}/assets/${product.image.filename_disk}`
            : undefined

          lineItem.price_data = {
            currency: activeCurrency, // Fixed: guaranteed string, never undefined
            product_data: {
              name: product.name || item.id,
              ...(productImageUrl && {
                images: [productImageUrl]
              }),
              // internal_product_id lets the webhook re-link this Stripe line
              // item back to the real Directus product when it writes the order.
              metadata: {
                ...(item.metadata || {}),
                internal_product_id: item.id
              }
            },
            unit_amount: Math.round(productPrice * 100)
          }

          if (mode === 'subscription') {
            lineItem.price_data.recurring = {
              interval: 'month'
            }
          }

          if (taxRates && taxRates.length > 0) {
            lineItem.tax_rates = taxRates
          }
        }

        return lineItem
      })
    )

    // 2. Determine overall session mode using our temp array
    const hasRecurring = tempLineItems.some((li) => li._mode === 'subscription')
    const sessionMode: 'payment' | 'subscription' | 'setup' =
      mode === 'setup' ?
      'setup' :
      hasRecurring || mode === 'subscription' ?
      'subscription' :
      'payment'

    // 3. Strip out the temporary '_mode' property before passing to Stripe
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = tempLineItems.map(
      ({
        _mode,
        ...stripeCompatibleItem
      }) => stripeCompatibleItem
    )

    // Build Stripe session configuration
    const isDev = process.env.NODE_ENV !== 'production'
    const origin = getHeader(event, 'origin') || (isDev ? 'http://localhost:3000' : '')
    const domain = process.env.DOMAIN || process.env.NUXT_PUBLIC_SITE_URL || origin
    if (!domain) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Checkout domain is not configured (set DOMAIN or NUXT_PUBLIC_SITE_URL)'
      })
    }

    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      line_items: lineItems,
      mode: sessionMode,
      ui_mode: 'embedded_page',
      // Stripe docs: redirect back with the session id so the app can load
      // details — /success reads it via /api/payment/stripe/done.
      return_url: successUrl || `${domain}/success?session_id={CHECKOUT_SESSION_ID}`,
      // Tag the session for Dashboard checkout-flow tracking/comparison.
      integration_identifier: `alternate-checkout-${randomSuffix}`,
      ...(locale && locale !== 'auto' && {
        locale: locale as Stripe.Checkout.SessionCreateParams.Locale
      }),
      ...(allowPromotionCodes && {
        allow_promotion_codes: allowPromotionCodes
      }),
      // buyer_id always comes from the resolved session, never from the
      // client-supplied metadata object — the webhook uses it to attribute
      // the resulting order, so it must not be spoofable.
      metadata: {
        ...(metadata || {}),
        ...(buyerId && { buyer_id: buyerId }),
        // Read back by the webhook after payment to purchase the actual
        // shipping label for the rate the buyer was charged for.
        ...(shippoRateId && { shippo_rate_id: shippoRateId })
      }
    }

    // Add customer information
    if (customerId && customerEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot specify both customerId and customerEmail'
      })
    }

    if (customerId) {
      sessionConfig.customer = customerId
    } else if (customerEmail) {
      sessionConfig.customer_email = customerEmail
    }

    // Add address collection
    const addressCollection: any = {}
    if (collectShippingAddress) {
      addressCollection.allowed_countries = ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE'] // Add your supported countries
    }
    if (collectBillingAddress || collectShippingAddress) {
      sessionConfig.billing_address_collection = collectBillingAddress ? 'required' : 'auto'
    }
    if (collectShippingAddress) {
      sessionConfig.shipping_address_collection = addressCollection
    }

    // Add shipping options
    if (shippingOptions && shippingOptions.length > 0) {
      sessionConfig.shipping_options = shippingOptions
    } else if (shippoRateId) {
      // The client only sends the Shippo rate id it displayed to the buyer —
      // the amount actually charged is re-fetched from Shippo here, never
      // taken from the client, the same way product prices are re-resolved
      // from Directus above.
      const rate = await getRate(shippoRateId).catch(() => null)
      const rateAmount = Number(rate?.amount)

      if (!rate || !Number.isFinite(rateAmount)) {
        throw createError({ statusCode: 400, statusMessage: 'Unknown or expired shipping rate' })
      }

      const serviceName = (rate as any).servicelevel?.name || (rate as any).servicelevel_name || rate.provider

      sessionConfig.shipping_options = [{
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: Math.round(rateAmount * 100),
            currency: (rate.currency || activeCurrency).toLowerCase(),
          },
          display_name: `${rate.provider} ${serviceName}`.trim(),
          delivery_estimate: rate.estimated_days ? {
            minimum: { unit: 'business_day', value: rate.estimated_days },
            maximum: { unit: 'business_day', value: rate.estimated_days },
          } : undefined,
        },
      }]
    }

    // Add discounts
    if (discounts && discounts.length > 0) {
      sessionConfig.discounts = discounts
    }

    // Connected account payouts + subscription data (Stripe docs pattern)
    if (sessionMode === 'subscription') {
      sessionConfig.subscription_data = {
        ...(accountId ? {
          transfer_data: {
            destination: accountId
          }
        } : {}),
        ...(subscriptionData || {}),
      }
    } else if (sessionMode === 'payment' && accountId) {
      sessionConfig.payment_intent_data = {
        transfer_data: {
          destination: accountId
        }
      }
    }

    // Add cancel URL for hosted checkout (optional)
    if (cancelUrl) {
      sessionConfig.cancel_url = cancelUrl
    }

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create(sessionConfig)

    return {
      success: true,
      clientSecret: session.client_secret,
      sessionId: session.id,
      url: session.url // For redirect mode
    }

  } catch (stripeError: any) {
    console.error('Stripe error:', stripeError)

    if (stripeError.statusCode) {
      throw createError({
        statusCode: stripeError.statusCode,
        statusMessage: stripeError.message
      })
    }

    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to create checkout session'
    })
  }
})