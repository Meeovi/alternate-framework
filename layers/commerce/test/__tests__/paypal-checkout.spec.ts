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
// The store's tax quote: by default its price, no tax.
const quoteTax = vi.fn()
const noTax = async (request: any) => {
  const subtotal = request.items.reduce((sum: number, item: any) => sum + Number(products[item.key]!.price) * item.qty, 0)
  return { currency: 'USD', items: request.items.length ? { subtotal, discount: 0, tax: 0, grandTotal: subtotal } : null, otherLines: [], otherTax: 0, shippingTax: 0, pricesIncludeTax: false, shippingIncludesTax: false }
}
registerCommerceBackendAdapter({
  id: 'magento',
  collections: ['products'],
  isEnabled: () => true,
  request: vi.fn(async ({ key }: { key: string }) => products[key] ?? null),
  placePaidOrder: vi.fn(),
  quoteTax: (request: any) => quoteTax(request),
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
  quoteTax.mockReset()
  quoteTax.mockImplementation(noTax)
})

describe('PayPal custom_id', () => {
  it('round-trips the buyer, the Shippo rate and each backend\'s tax', () => {
    const ref = encodeCheckoutRef({ buyerId: 'user-1', shippoRateId: 'rate42', backendTaxCents: { magento: 124, other: 0 } })
    expect(ref).toBe('b=user-1;r=rate42;t=magento:124')
    expect(decodeCheckoutRef(ref)).toEqual({ buyerId: 'user-1', shippoRateId: 'rate42', backendTaxCents: { magento: 124 } })
    expect(encodeCheckoutRef({ buyerId: null, shippoRateId: null })).toBeUndefined()
    expect(decodeCheckoutRef(undefined)).toEqual({ buyerId: null, shippoRateId: null, backendTaxCents: {} })
  })

  it('refuses rather than cut a reference past PayPal\'s 127 characters', () => {
    // A real one (uuid buyer, Shippo rate id, one backend's tax) is ~90.
    expect(encodeCheckoutRef({ buyerId: '01a14c38-97ab-766b-b219-e99f11adda54', shippoRateId: 'a'.repeat(32), backendTaxCents: { magento: 12345 } })!.length).toBeLessThan(127)
    expect(() => encodeCheckoutRef({ buyerId: 'x'.repeat(200), shippoRateId: null })).toThrow('too long')
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

  it("adds the store's tax on its own lines, quoted for the buyer and address", async () => {
    getRate.mockResolvedValue({ amount: '5.48', currency: 'USD', provider: 'USPS', servicelevel: { name: 'Ground' } })
    quoteTax.mockImplementation(async (request: any) => request.items.length
      ? { currency: 'USD', items: { subtotal: 24, discount: 0, tax: 1.98, grandTotal: 25.98 }, otherLines: [], otherTax: 0, shippingTax: 0, pricesIncludeTax: false, shippingIncludesTax: false }
      : { currency: 'USD', items: null, otherLines: [], otherTax: 0, shippingTax: 0.45, pricesIncludeTax: false, shippingIncludesTax: false })
    const cart = await priceCart({
      items: [{ id: 'magento:mug', quantity: 2 }], shippoRateId: 'rate42', buyer: { id: 'u1', magentoCustomerId: 9 },
      address: { street1: '1 Main St', city: 'Detroit', state: 'MI', zip: '48201', country: 'us' },
    })
    // 1.98 on the store's lines (recorded with its order) + 0.45 on shipping.
    expect(cart).toMatchObject({ itemCents: 2400, taxCents: 243, backendTaxCents: { magento: 198 } })
    expect(quoteTax).toHaveBeenCalledWith(expect.objectContaining({
      customerId: '9', items: [{ key: 'mug', qty: 2 }], otherLines: [],
      address: { country_id: 'US', region_code: 'MI', postcode: '48201', city: 'Detroit', street: ['1 Main St'] },
    }))
    expect(quoteTax).toHaveBeenCalledWith(expect.objectContaining({ items: [], shippingAmount: 5.48 }))
  })

  it("refuses when the store's price no longer matches, or it applies a discount", async () => {
    quoteTax.mockResolvedValue({ currency: 'USD', items: { subtotal: 5.99, discount: 0, tax: 0, grandTotal: 5.99 }, otherLines: [], otherTax: 0, shippingTax: 0, pricesIncludeTax: false, shippingIncludesTax: false })
    await expect(priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: { id: 'u1', magentoCustomerId: 9 } })).rejects.toMatchObject({ statusCode: 409 })
    quoteTax.mockResolvedValue({ currency: 'USD', items: { subtotal: 4.99, discount: 1, tax: 0, grandTotal: 3.99 }, otherLines: [], otherTax: 0, shippingTax: 0, pricesIncludeTax: false, shippingIncludesTax: false })
    await expect(priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: { id: 'u1', magentoCustomerId: 9 } })).rejects.toMatchObject({ statusCode: 409 })
  })

  it("doesn't take payment when the store can't quote tax", async () => {
    quoteTax.mockRejectedValue(new Error('store down'))
    await expect(priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: { id: 'u1', magentoCustomerId: 9 } })).rejects.toMatchObject({ statusCode: 502 })
  })

  it('charges nothing extra when catalogue prices already include tax', async () => {
    quoteTax.mockResolvedValue({ currency: 'USD', items: { subtotal: 4.16, discount: 0, tax: 0.83, grandTotal: 4.99 }, otherLines: [], otherTax: 0, shippingTax: 0, pricesIncludeTax: true, shippingIncludesTax: false })
    expect(await priceCart({ items: [{ id: 'magento:ebook', quantity: 1 }], buyer: { id: 'u1', magentoCustomerId: 9 } })).toMatchObject({ itemCents: 499, taxCents: 0 })
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
