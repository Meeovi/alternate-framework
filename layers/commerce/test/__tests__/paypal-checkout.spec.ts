import { beforeEach, describe, expect, it, vi } from 'vitest'
import { registerCommerceBackendAdapter } from 'alternate-sdk'

// Nitro auto-imports these in the real server.
;(globalThis as any).createError = (e: { statusCode: number, statusMessage: string }) => Object.assign(new Error(e.statusMessage), e)
;(globalThis as any).useRuntimeConfig = () => ({ paypalMode: 'sandbox' })

vi.mock('#auth/server/utils/drizzle', () => ({ db: {} }))
vi.mock('#auth/server/database/migrations/schema', () => ({ cart: {}, cartItems: {}, users: {} }))
vi.mock('#auth/server/utils/sessions', () => ({ getAuthSession: vi.fn() }))
vi.mock('#shared/server/utils/novu', () => ({ triggerNovuWorkflow: vi.fn() }))
vi.mock('../../server/utils/directusClient', () => ({ getDirectusFacade: vi.fn() }))
vi.mock('../../server/utils/stripe', () => ({ stripe: {} }))
vi.mock('nitropack/runtime', () => ({ useRuntimeConfig: () => ({}) }))
vi.mock('../../server/licensing-host', () => ({ ensureIntegrationOffer: vi.fn(), repository: vi.fn(), useLicensing: vi.fn() }))

const getRate = vi.fn()
const createTransaction = vi.fn()
vi.mock('../../server/utils/shippo', () => ({ getRate: (id: string) => getRate(id), createTransaction: (t: unknown) => createTransaction(t) }))

// A fake Directus: rows per collection, and the writes made.
const rows: Record<string, any[]> = {}
const created: Record<string, any[]> = {}
vi.mock('@directus/sdk', () => ({
  createDirectus: () => ({ with() { return this }, request: async (op: any) => op() }),
  rest: () => ({}),
  staticToken: () => ({}),
  readItem: () => async () => null,
  readItems: (collection: string, q: any) => async () => {
    const [field, cond] = Object.entries(q.filter ?? {})[0] ?? []
    return (rows[collection] ?? []).filter((r) => !field || (cond as any)._eq === undefined || r[field as string] === (cond as any)._eq)
  },
  createItem: (collection: string, data: any) => async () => {
    const row = { id: (rows[collection]?.length ?? 0) + 1, ...data }
    ;(rows[collection] ??= []).push(row)
    ;(created[collection] ??= []).push(row)
    return row
  },
  updateItem: () => async () => ({}),
}))

const { encodeCheckoutRef, decodeCheckoutRef, paidCheckoutFromPayPal } = await import('../../server/utils/paypalCheckout')
const { priceCart } = await import('../../server/utils/checkoutCart')
const { fulfilPaidCheckout } = await import('../../server/utils/paidCheckout')

const products: Record<string, Record<string, unknown>> = {
  ebook: { name: 'E-book', price: 4.99, requires_shipping: false, status: 'published' },
  mug: { name: 'Mug', price: 12, requires_shipping: true, status: 'published' },
}
registerCommerceBackendAdapter({
  id: 'magento',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(async ({ key }: { key: string }) => products[key] ?? null),
  placePaidOrder: vi.fn(),
} as any)

const capturedOrder = (over: { status?: string } = {}) => ({
  id: 'ORDER123ABC',
  status: 'COMPLETED',
  payer: { email_address: 'buyer@example.com', name: { given_name: 'Ada', surname: 'Lovelace' } },
  purchase_units: [{
    custom_id: 'b=user-1;r=rate42',
    amount: { currency_code: 'USD', value: '29.48', breakdown: { item_total: { currency_code: 'USD', value: '24.00' }, shipping: { currency_code: 'USD', value: '5.48' } } },
    items: [{ name: 'Mug', sku: '7', quantity: '2', unit_amount: { currency_code: 'USD', value: '12.00' } }],
    shipping: { name: { full_name: 'Ada Lovelace' }, address: { address_line_1: '1 Main St', admin_area_2: 'Town', admin_area_1: 'CA', postal_code: '90001', country_code: 'US' } },
    payments: { captures: [{ id: 'CAPTURE9XYZ', status: over.status ?? 'COMPLETED', amount: { currency_code: 'USD', value: '29.48' }, create_time: '2026-10-20T21:00:00Z' }] },
  }],
})

beforeEach(() => {
  for (const key of Object.keys(rows)) delete rows[key]
  for (const key of Object.keys(created)) delete created[key]
  getRate.mockReset()
  createTransaction.mockReset()
})

describe('PayPal custom_id', () => {
  it('round-trips the buyer and the Shippo rate, and stays within PayPal\'s 127 characters', () => {
    const ref = encodeCheckoutRef({ buyerId: 'user-1', shippoRateId: 'rate42' })
    expect(decodeCheckoutRef(ref)).toEqual({ buyerId: 'user-1', shippoRateId: 'rate42' })
    expect(encodeCheckoutRef({ buyerId: 'x'.repeat(200), shippoRateId: null })!.length).toBe(127)
    expect(encodeCheckoutRef({ buyerId: null, shippoRateId: null })).toBeUndefined()
    expect(decodeCheckoutRef(undefined)).toEqual({ buyerId: null, shippoRateId: null })
  })
})

describe('paidCheckoutFromPayPal', () => {
  it('reads amounts, lines, buyer and shipping from the captured order', () => {
    expect(paidCheckoutFromPayPal(capturedOrder() as any)).toMatchObject({
      provider: 'paypal', paymentId: 'CAPTURE9XYZ', reference: 'ORDER123ABC', status: 'paid', currency: 'usd',
      totalCents: 2948, itemCents: 2400, shippingCents: 548, buyerId: 'user-1', shippoRateId: 'rate42',
      email: 'buyer@example.com', name: 'Ada Lovelace',
      lines: [{ ref: '7', name: 'Mug', quantity: 2, unitCents: 1200, totalCents: 2400 }],
      address: { line1: '1 Main St', city: 'Town', state: 'CA', postcode: '90001', country: 'US' },
    })
  })

  it('marks a capture that is still clearing as pending, and an uncaptured order as nothing', () => {
    expect(paidCheckoutFromPayPal(capturedOrder({ status: 'PENDING' }) as any)?.status).toBe('pending')
    const uncaptured = capturedOrder()
    delete (uncaptured.purchase_units[0] as any).payments
    expect(paidCheckoutFromPayPal(uncaptured as any)).toBeNull()
  })
})

describe('priceCart', () => {
  it('prices from the catalogue and the Shippo rate, never the client', async () => {
    getRate.mockResolvedValue({ amount: '5.48', currency: 'USD', provider: 'USPS', servicelevel: { name: 'Ground' }, estimated_days: 3 })
    const cart = await priceCart({ items: [{ id: 'magento:mug', quantity: 2, price: 0.01 } as any], shippoRateId: 'rate42', buyer: { id: 'u1', magentoCustomerId: 9 } })
    expect(cart).toMatchObject({ itemCents: 2400, shipping: { rateId: 'rate42', cents: 548, name: 'USPS Ground' }, hasBackendLines: true })
  })

  it('refuses a shippable cart without a rate, and an unknown rate', async () => {
    await expect(priceCart({ items: [{ id: 'magento:mug', quantity: 1 }], buyer: { id: 'u1', magentoCustomerId: 9 } })).rejects.toThrow('Choose a shipping method')
    getRate.mockResolvedValue(null)
    await expect(priceCart({ items: [{ id: 'magento:mug', quantity: 1 }], shippoRateId: 'gone', buyer: { id: 'u1', magentoCustomerId: 9 } })).rejects.toThrow('expired shipping rate')
  })

  it('needs a signed-in, linked buyer for a commerce-backend line', async () => {
    await expect(priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: null })).rejects.toThrow('Sign in')
    await expect(priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: { id: 'u1' } })).rejects.toThrow("isn't linked")
  })
})

describe('fulfilPaidCheckout', () => {
  const paid = () => paidCheckoutFromPayPal(capturedOrder() as any)!

  it('records the payment and the order once, and buys the label', async () => {
    createTransaction.mockResolvedValue({ status: 'SUCCESS', tracking_number: 'TRK1', tracking_url_provider: 'https://track', label_url: 'https://label' })
    getRate.mockResolvedValue({ provider: 'USPS' })
    await fulfilPaidCheckout(paid())
    await fulfilPaidCheckout(paid())
    expect(created.os_payments).toHaveLength(1)
    expect(created.orders).toHaveLength(1)
    expect(created.orders![0]).toMatchObject({
      payment_provider: 'paypal', payment_id: 'CAPTURE9XYZ', buyer_id: 'user-1', grand_total: 2948, shipping_amount: 548,
      payment_status: 'completed', fulfillment_status: 'shipped', tracking_number: 'TRK1', customer_firstname: 'Ada',
    })
    expect(createTransaction).toHaveBeenCalledTimes(1)
  })

  it('waits for a pending payment to clear before making the order or buying a label', async () => {
    await fulfilPaidCheckout({ ...paid(), status: 'pending' })
    expect(created.os_payments).toHaveLength(1)
    expect(created.orders).toBeUndefined()
    expect(createTransaction).not.toHaveBeenCalled()
  })
})
