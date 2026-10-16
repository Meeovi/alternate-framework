import { afterEach, beforeAll, describe, expect, test, vi } from 'vitest'

beforeAll(() => {
  ;(globalThis as any).useRuntimeConfig = () => ({ meeoviDropshipping: { secret: 'x'.repeat(40) } })
})
afterEach(() => vi.restoreAllMocks())

describe('pricing', async () => {
  const { priceFrom, checkMarkup } = await import('../server/utils/store')
  test('percent and fixed markups', () => {
    expect(priceFrom(10, { type: 'percent', value: 40 })).toBe(14)
    expect(priceFrom(10, { type: 'fixed', value: 2.5 })).toBe(12.5)
  })
  test('charm pricing rounds up to .99', () => {
    expect(priceFrom(10, { type: 'percent', value: 40, charmPricing: true })).toBe(13.99)
    expect(priceFrom(0.1, { type: 'fixed', value: 0, charmPricing: true })).toBe(0.99)
  })
  test('rejects silly markups', () => {
    expect(() => checkMarkup({ type: 'percent', value: -5 })).toThrow()
    expect(() => checkMarkup({ type: 'percent', value: 5000 })).toThrow()
    expect(checkMarkup(undefined)).toEqual({ type: 'percent', value: 40, charmPricing: false })
  })
})

describe('credentials at rest', async () => {
  const { sealCredentials, openCredentials, skuFor } = await import('../server/utils/context')
  test('round-trips and never stores plaintext', () => {
    const sealed = sealCredentials({ apiKey: 'CJ-secret-key-123' })
    expect(sealed).not.toContain('CJ-secret-key-123')
    expect(openCredentials(sealed)).toEqual({ apiKey: 'CJ-secret-key-123' })
  })
  test('tampering is detected', () => {
    const [v, iv, tag, body] = sealCredentials({ token: 'abc' }).split('.')
    const flipped = Buffer.from(body!, 'base64'); flipped[0]! ^= 1
    expect(() => openCredentials([v, iv, tag, flipped.toString('base64')].join('.'))).toThrow()
  })
  test('a different secret cannot open it', () => {
    const sealed = sealCredentials({ token: 'abc' })
    ;(globalThis as any).useRuntimeConfig = () => ({ meeoviDropshipping: { secret: 'y'.repeat(40) } })
    expect(() => openCredentials(sealed)).toThrow()
    ;(globalThis as any).useRuntimeConfig = () => ({ meeoviDropshipping: { secret: 'x'.repeat(40) } })
  })
  test('SKUs are seller-scoped and Magento-safe', () => {
    expect(skuFor('cj', 42, '7874B45D-E971-4DC8')).toBe('DS-CJ-42-7874B45D-E971-4DC8')
    expect(skuFor('printful', 7, '12/34 x')).toBe('DS-PRINTFUL-7-1234x')
    expect(skuFor('cj', 1, 'a'.repeat(300)).length).toBeLessThanOrEqual(128)
  })
})

describe('image downloads refuse internal targets', async () => {
  const { fetchImage } = await import('../server/utils/images')
  test.each([
    'http://example.com/a.jpg',
    'https://127.0.0.1/a.jpg',
    'https://localhost/a.jpg',
    'https://169.254.169.254/latest/meta-data',
    'https://[::1]/a.jpg',
    'https://user:pw@example.com/a.jpg',
  ])('%s', async (url) => {
    await expect(fetchImage(url)).rejects.toThrow()
  })
  test('a redirect to an internal host is refused', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 302, headers: { location: 'https://127.0.0.1/x.png' } }))
    await expect(fetchImage('https://files.cdn.printful.com/a.png')).rejects.toThrow(/not public/)
  })
  test('non-image bytes are dropped', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('<html>nope</html>', { status: 200 }))
    expect(await fetchImage('https://example.com/a.png')).toBeNull()
  })
  test('a real PNG is accepted', async () => {
    const png = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex')
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(png, { status: 200 }))
    expect((await fetchImage('https://files.cdn.printful.com/shirt.png'))?.mimeType).toBe('image/png')
  })
  test('hosts the integration did not declare are never contacted', async () => {
    const spy = vi.spyOn(globalThis, 'fetch')
    expect(await fetchImage('https://example.com/shirt.png')).toBeNull()
    expect(spy).not.toHaveBeenCalled()
  })
})

describe('CJ orders are never paid automatically', async () => {
  const { cj } = await import('../server/providers/cj')
  test('createOrderV2 uses payType 3 and the cheapest shipping', async () => {
    const calls: any[] = []
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url: any, init: any) => {
      calls.push({ url: String(url), body: init?.body ? JSON.parse(init.body) : null })
      const data = String(url).includes('freightCalculate')
        ? [{ logisticName: 'Slow', logisticPrice: 3 }, { logisticName: 'Cheap', logisticPrice: 1.5 }]
        : { orderId: 'CJ123' }
      return new Response(JSON.stringify({ code: 200, result: true, message: 'ok', data }), { status: 200 })
    })
    const result = await cj.createOrder({ accessToken: 't' }, {
      externalId: '000001-42', confirm: true,
      recipient: { name: 'A B', address1: '1 Road', city: 'Leeds', countryCode: 'GB', postcode: 'LS1 1AA' },
      items: [{ variantId: 'V1', quantity: 2 }],
    })
    expect(result).toEqual({ supplierOrderId: 'CJ123', status: 'awaiting_payment' })
    const order = calls.find((c) => c.url.includes('createOrderV2')).body
    expect(order.payType).toBe(3)
    expect(order.logisticName).toBe('Cheap')
    expect(order.products).toEqual([{ vid: 'V1', quantity: 2 }])
  })
})
