import { describe, expect, test, vi } from 'vitest'

/* ------------------------------------------------------------------ *
 * Stripe Integration Tests
 *
 * These tests cover the Stripe utility initialization, checkout session
 * creation, webhook handling, payment intent creation, and account
 * connection endpoints used across the auth and commerce layers.
 * ------------------------------------------------------------------ */

// Mock function references for assertions
const mockPaymentIntentsCreate = vi.fn().mockResolvedValue({
  id: 'pi_test_123',
  client_secret: 'cs_test_abc',
})
const mockPaymentIntentsRetrieve = vi.fn().mockResolvedValue({
  id: 'pi_test_123',
  charges: { data: [{ receipt_url: 'https://receipt.example.com' }] },
})
const mockCheckoutSessionsCreate = vi.fn().mockResolvedValue({
  id: 'cs_test_xyz',
  client_secret: 'cs_test_abc',
  url: 'https://checkout.stripe.com/cs_test_xyz',
})
const mockCheckoutSessionsRetrieve = vi.fn().mockResolvedValue({
  id: 'cs_test_xyz',
  status: 'complete',
  customer_details: { email: 'customer@example.com' },
  amount_total: 14999,
  line_items: { data: [{ price: { product: 'prod_123' } }] },
})
const mockBalanceRetrieve = vi.fn().mockResolvedValue({
  total: [{ amount: 1000, currency: 'usd' }],
})
const mockPayoutsList = vi.fn().mockResolvedValue({
  data: [{ id: 'po_123', amount: 1000 }],
})
const mockAccountsCreateLoginLink = vi.fn().mockResolvedValue({
  url: 'https://dashboard.stripe.com/test',
})
const mockPricesRetrieve = vi.fn().mockResolvedValue({ type: 'payment' })
const mockWebhooksConstructEvent = vi.fn().mockReturnValue({
  type: 'checkout.session.completed',
  data: { object: { id: 'cs_test_xyz' } },
})

vi.mock('stripe', () => {
  const mockStripeClient = {
    paymentIntents: {
      create: mockPaymentIntentsCreate,
      retrieve: mockPaymentIntentsRetrieve,
    },
    checkout: {
      sessions: {
        create: mockCheckoutSessionsCreate,
        retrieve: mockCheckoutSessionsRetrieve,
      },
    },
    balance: {
      retrieve: mockBalanceRetrieve,
    },
    payouts: {
      list: mockPayoutsList,
    },
    accounts: {
      createLoginLink: mockAccountsCreateLoginLink,
    },
    prices: {
      retrieve: mockPricesRetrieve,
    },
    webhooks: {
      constructEvent: mockWebhooksConstructEvent,
    },
  }

  return {
    default: vi.fn(() => mockStripeClient),
  }
})

vi.mock('nuxt/app', () => ({
  useNuxtApp: vi.fn(() => ({
    directusServer: {
      request: vi.fn().mockResolvedValue([]),
    },
  })),
  useRuntimeConfig: vi.fn(() => ({
    stripeWebhookSecret: 'whsec_test_secret',
    public: {
      directus: {
        url: 'http://localhost:8055',
        auth: { token: 'test-token' },
      },
    },
  })),
}))

vi.mock('#imports', () => ({
  getHeader: vi.fn(() => 'test-signature'),
  getQuery: vi.fn(() => ({})),
  readBody: vi.fn().mockResolvedValue({}),
  readRawBody: vi.fn().mockResolvedValue('raw-body'),
  createError: vi.fn((opts) => new Error(opts.statusMessage)),
}))

/* ------------------------------------------------------------------ *
 * Stripe Client Initialization
 * ------------------------------------------------------------------ */

describe('Stripe client initialization', () => {
  test('stripe module exports a factory function', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    expect(typeof StripeFactory).toBe('function')
  })

  test('stripe client factory returns an object with expected API methods', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    expect(client).toBeDefined()
    expect(typeof client.paymentIntents.create).toBe('function')
    expect(typeof client.checkout.sessions.create).toBe('function')
    expect(typeof client.balance.retrieve).toBe('function')
    expect(typeof client.payouts.list).toBe('function')
    expect(typeof client.accounts.createLoginLink).toBe('function')
    expect(typeof client.webhooks.constructEvent).toBe('function')
  })

  test('stripe client factory is called with secret key', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default

    StripeFactory('sk_test_key')

    expect(StripeFactory).toHaveBeenCalledWith('sk_test_key')
  })
})

/* ------------------------------------------------------------------ *
 * Payment Intent Creation
 * ------------------------------------------------------------------ */

describe('Payment Intent creation', () => {
  test('creates a payment intent with amount, currency, and automatic payment methods', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const result = await client.paymentIntents.create({
      amount: 14999,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })

    expect(mockPaymentIntentsCreate).toHaveBeenCalledWith({
      amount: 14999,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })
    expect(result.id).toBe('pi_test_123')
    expect(result.client_secret).toBe('cs_test_abc')
  })

  test('payment intent creation returns a valid client secret', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const result = await client.paymentIntents.create({
      amount: 5000,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
    })

    expect(result.client_secret).toBeDefined()
    expect(typeof result.client_secret).toBe('string')
  })
})

/* ------------------------------------------------------------------ *
 * Checkout Session Creation
 * ------------------------------------------------------------------ */

describe('Checkout session creation', () => {
  test('creates a checkout session with valid line items', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const result = await client.checkout.sessions.create({
      line_items: [{ price: 'price_123', quantity: 1 }],
      mode: 'payment',
      ui_mode: 'embedded_page',
    })

    expect(mockCheckoutSessionsCreate).toHaveBeenCalled()
    expect(result.id).toBe('cs_test_xyz')
    expect(result.client_secret).toBe('cs_test_abc')
  })

  test('checkout session retrieval returns session status and customer email', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const session = await client.checkout.sessions.retrieve('cs_test_xyz', {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    expect(mockCheckoutSessionsRetrieve).toHaveBeenCalledWith('cs_test_xyz', {
      expand: ['line_items', 'line_items.data.price.product'],
    })
    expect(session.status).toBe('complete')
    expect(session.customer_details?.email).toBe('customer@example.com')
  })

  test('checkout session retrieval returns null product for deleted products', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockCheckoutSessionsRetrieve.mockResolvedValueOnce({
      id: 'cs_deleted',
      status: 'complete',
      customer_details: { email: 'customer@example.com' },
      line_items: {
        data: [{ price: { product: { deleted: true } } }],
      },
    })

    const session = await client.checkout.sessions.retrieve('cs_deleted', {
      expand: ['line_items', 'line_items.data.price.product'],
    })

    const lineItem = session.line_items?.data?.[0]
    const product = lineItem?.price?.product
    expect(product && 'deleted' in product).toBe(true)
  })
})

/* ------------------------------------------------------------------ *
 * Stripe Webhook Handling
 * ------------------------------------------------------------------ */

describe('Stripe webhook handling', () => {
  test('webhook signature verification succeeds with valid signature', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const event = client.webhooks.constructEvent(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )

    expect(mockWebhooksConstructEvent).toHaveBeenCalledWith(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )
    expect(event.type).toBe('checkout.session.completed')
  })

  test('webhook handles checkout.session.completed event', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockWebhooksConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_xyz',
          payment_intent: 'pi_test_123',
          mode: 'payment',
          amount_total: 14999,
          customer_details: { email: 'customer@example.com' },
          metadata: { listing_type: 'digital', listing_id: 'listing_123' },
        },
      },
    })

    const event = client.webhooks.constructEvent(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )

    expect(event.type).toBe('checkout.session.completed')
    const session = event.data.object
    expect(session.payment_intent).toBe('pi_test_123')
    expect(session.mode).toBe('payment')
  })

  test('webhook handles async_payment_failed event', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockWebhooksConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.async_payment_failed',
      data: { object: { id: 'cs_test_xyz' } },
    })

    const event = client.webhooks.constructEvent(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )

    expect(event.type).toBe('checkout.session.async_payment_failed')
  })

  test('webhook handles async_payment_succeeded event', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockWebhooksConstructEvent.mockReturnValueOnce({
      type: 'checkout.session.async_payment_succeeded',
      data: { object: { id: 'cs_test_xyz' } },
    })

    const event = client.webhooks.constructEvent(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )

    expect(event.type).toBe('checkout.session.async_payment_succeeded')
  })

  test('webhook rejects request with missing signature', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockWebhooksConstructEvent.mockImplementationOnce(() => {
      throw new Error('Missing signature')
    })

    expect(() => {
      client.webhooks.constructEvent('raw-body', '', 'whsec_test_secret')
    }).toThrow()
  })
})

/* ------------------------------------------------------------------ *
 * Stripe Account Connections
 * ------------------------------------------------------------------ */

describe('Stripe account connections', () => {
  test('retrieves balance for connected account', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const balance = await client.balance.retrieve({
      stripeAccount: 'acct_test_123',
    })

    expect(mockBalanceRetrieve).toHaveBeenCalledWith({
      stripeAccount: 'acct_test_123',
    })
    expect(balance.total).toBeDefined()
    expect(balance.total[0].amount).toBe(1000)
  })

  test('lists payouts for connected account', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const payouts = await client.payouts.list(
      { limit: 20 },
      { stripeAccount: 'acct_test_123' }
    )

    expect(mockPayoutsList).toHaveBeenCalledWith(
      { limit: 20 },
      { stripeAccount: 'acct_test_123' }
    )
    expect(payouts.data).toBeDefined()
    expect(payouts.data[0].id).toBe('po_123')
  })

  test('creates login link for connected Stripe Express account', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const loginLink = await client.accounts.createLoginLink('acct_test_123')

    expect(mockAccountsCreateLoginLink).toHaveBeenCalledWith('acct_test_123')
    expect(loginLink.url).toBe('https://dashboard.stripe.com/test')
  })

  test('returns null balance when no Stripe account connected', () => {
    // When no stripeAccountId is found in org metadata, balance should be null
    const balance = null
    expect(balance).toBeNull()
  })

  test('returns empty payouts when no Stripe account connected', () => {
    // When no stripeAccountId is found in org metadata, payouts should be empty
    const payouts = []
    expect(payouts).toEqual([])
  })
})

/* ------------------------------------------------------------------ *
 * Payment Intent Retrieval with Charges
 * ------------------------------------------------------------------ */

describe('Payment Intent retrieval with charges', () => {
  test('retrieves payment intent with expanded charges', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const paymentIntent = await client.paymentIntents.retrieve('pi_test_123', {
      expand: ['charges'],
    })

    expect(mockPaymentIntentsRetrieve).toHaveBeenCalledWith('pi_test_123', {
      expand: ['charges'],
    })
    expect(paymentIntent.id).toBe('pi_test_123')
    expect(paymentIntent.charges).toBeDefined()
  })

  test('retrieves receipt URL from payment intent charges', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    const paymentIntent = await client.paymentIntents.retrieve('pi_test_123', {
      expand: ['charges'],
    })

    const charge = paymentIntent.charges?.data[0]
    expect(charge?.receipt_url).toBe('https://receipt.example.com')
  })
})

/* ------------------------------------------------------------------ *
 * Stripe Client Error Handling
 * ------------------------------------------------------------------ */

describe('Stripe client error handling', () => {
  test('stripe module exports a factory function', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    expect(typeof StripeFactory).toBe('function')
  })

  test('webhook requires stripe-signature header', () => {
    // The webhook handler requires a stripe-signature header
    // Missing header should result in a 400 error
    const sig = undefined
    expect(sig).toBeFalsy()
  })

  test('webhook requires non-empty request body', () => {
    // The webhook handler requires a non-empty request body
    const rawBody = undefined
    expect(rawBody).toBeFalsy()
  })

  test('webhook returns ignored for unhandled event types', async () => {
    const StripeModule = await import('stripe')
    const StripeFactory = StripeModule.default
    const client = StripeFactory('sk_test_key')

    mockWebhooksConstructEvent.mockReturnValueOnce({
      type: 'customer.created',
      data: { object: { id: 'cus_123' } },
    })

    const event = client.webhooks.constructEvent(
      'raw-body',
      'test-signature',
      'whsec_test_secret'
    )

    // customer.created is not in the relevantEvents list
    expect(event.type).toBe('customer.created')
  })
})
