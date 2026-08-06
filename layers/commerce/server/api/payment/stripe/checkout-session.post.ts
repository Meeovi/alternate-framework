// server/api/payment/stripe/checkout-session.post.ts
import Stripe from 'stripe'
import Joi from 'joi'
import { stripe } from '../../../utils/stripe'

// 8 random letters for the integration_identifier suffix (per stripe skill).
const randomSuffix = Array.from({ length: 8 }, () =>
  'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]
).join('')

// Validation schemas
const itemSchema = Joi.object({
  id: Joi.string().required(),
  priceId: Joi.string().optional(),
  name: Joi.string().when('priceId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
  description: Joi.string().optional(),
  price: Joi.number().positive().when('priceId', {
    is: Joi.exist(),
    then: Joi.optional(),
    otherwise: Joi.required()
  }),
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
  ).optional()
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
      shippingOptions
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
          lineItem.price_data = {
            currency: activeCurrency, // Fixed: guaranteed string, never undefined
            product_data: {
              name: item.name!,
              ...(item.description && {
                description: item.description
              }),
              ...(item.images && item.images.length > 0 && {
                images: item.images
              }),
              ...(item.metadata && {
                metadata: item.metadata
              })
            },
            unit_amount: Math.round(item.price! * 100)
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
      // Stripe docs: redirect back with the session id so the app can load details
      return_url: successUrl || `${domain}/done?session_id={CHECKOUT_SESSION_ID}`,
      // Tag the session for Dashboard checkout-flow tracking/comparison.
      integration_identifier: `alternate-checkout-${randomSuffix}`,
      ...(locale && locale !== 'auto' && {
        locale: locale as Stripe.Checkout.SessionCreateParams.Locale
      }),
      ...(allowPromotionCodes && {
        allow_promotion_codes: allowPromotionCodes
      }),
      ...(metadata && {
        metadata
      })
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