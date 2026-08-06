import { describe, expect, test } from 'vitest'
import { z } from 'zod'

/* ------------------------------------------------------------------ *
 * Better-Notify Input Schemas: Auth & Commerce
 * ------------------------------------------------------------------ */

// Auth Welcome Notification Input
export const authWelcomeInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  email: z.string().email('Invalid email address'),
  firstName: z.string().trim().min(1, 'First name cannot be empty'),
  dashboardUrl: z.string().url('Invalid dashboard URL'),
})

// Order Confirmation Line Item Schema
export const orderItemInput = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

// Commerce Order Confirmation Input
export const orderConfirmationInput = z.object({
  userId: z.string().min(1, 'userId is required'),
  orderId: z.string().min(1, 'orderId is required'),
  totalAmount: z.number().positive('Total amount must be greater than zero'),
  currency: z.string().length(3, 'Currency code must be exactly 3 uppercase letters').regex(/^[A-Z]{3}$/),
  itemCount: z.number().int().positive('Item count must be at least 1'),
  items: z.array(orderItemInput).min(1, 'Order must contain at least one item'),
  receiptUrl: z.string().url('Invalid receipt URL'),
})

/* ------------------------------------------------------------------ *
 * Auth Welcome Notification Tests
 * ------------------------------------------------------------------ */

describe('authWelcomeInput schema', () => {
  test('validates valid auth welcome notification input', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'sebastian@example.com',
      firstName: 'Sebastian',
      dashboardUrl: 'https://meeovi.com/dashboard',
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.userId).toBe('user_99812')
      expect(result.data.email).toBe('sebastian@example.com')
      expect(result.data.firstName).toBe('Sebastian')
    }
  })

  test('rejects missing or empty userId', () => {
    const result = authWelcomeInput.safeParse({
      userId: '',
      email: 'sebastian@example.com',
      firstName: 'Sebastian',
      dashboardUrl: 'https://meeovi.com/dashboard',
    })

    expect(result.success).toBe(false)
  })

  test('rejects malformed email address', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'not-an-email',
      firstName: 'Sebastian',
      dashboardUrl: 'https://meeovi.com/dashboard',
    })

    expect(result.success).toBe(false)
  })

  test('rejects whitespace-only firstName', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'sebastian@example.com',
      firstName: '    ',
      dashboardUrl: 'https://meeovi.com/dashboard',
    })

    expect(result.success).toBe(false)
  })

  test('rejects non-URL dashboardUrl string', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'sebastian@example.com',
      firstName: 'Sebastian',
      dashboardUrl: '/dashboard/relative-path',
    })

    expect(result.success).toBe(false)
  })

  test('rejects missing firstName', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'sebastian@example.com',
      dashboardUrl: 'https://meeovi.com/dashboard',
    })

    expect(result.success).toBe(false)
  })

  test('rejects missing dashboardUrl', () => {
    const result = authWelcomeInput.safeParse({
      userId: 'user_99812',
      email: 'sebastian@example.com',
      firstName: 'Sebastian',
    })

    expect(result.success).toBe(false)
  })
})

/* ------------------------------------------------------------------ *
 * Commerce Order Confirmation Notification Tests
 * ------------------------------------------------------------------ */

describe('orderConfirmationInput schema', () => {
  const validPayload = {
    userId: 'user_99812',
    orderId: 'ord_2026_8819',
    totalAmount: 149.99,
    currency: 'GBP',
    itemCount: 2,
    items: [
      {
        productId: 'prod_1',
        name: 'Meeovi Pro Wireless Headphones',
        quantity: 1,
        unitPrice: 99.99,
      },
      {
        productId: 'prod_2',
        name: 'Headphone Stand',
        quantity: 1,
        unitPrice: 50.00,
      },
    ],
    receiptUrl: 'https://meeovi.com/orders/ord_2026_8819/receipt',
  }

  test('validates valid order confirmation input', () => {
    const result = orderConfirmationInput.safeParse(validPayload)

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.orderId).toBe('ord_2026_8819')
      expect(result.data.totalAmount).toBe(149.99)
      expect(result.data.currency).toBe('GBP')
      expect(result.data.items).toHaveLength(2)
    }
  })

  test('rejects negative or zero totalAmount', () => {
    const zeroResult = orderConfirmationInput.safeParse({
      ...validPayload,
      totalAmount: 0,
    })

    const negativeResult = orderConfirmationInput.safeParse({
      ...validPayload,
      totalAmount: -10.50,
    })

    expect(zeroResult.success).toBe(false)
    expect(negativeResult.success).toBe(false)
  })

  test('rejects invalid currency formats', () => {
    const lowercaseResult = orderConfirmationInput.safeParse({
      ...validPayload,
      currency: 'gbp',
    })

    const invalidLengthResult = orderConfirmationInput.safeParse({
      ...validPayload,
      currency: 'USDT',
    })

    expect(lowercaseResult.success).toBe(false)
    expect(invalidLengthResult.success).toBe(false)
  })

  test('rejects empty items array', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      items: [],
    })

    expect(result.success).toBe(false)
  })

  test('rejects non-integer or zero itemCount', () => {
    const floatCountResult = orderConfirmationInput.safeParse({
      ...validPayload,
      itemCount: 2.5,
    })

    const zeroCountResult = orderConfirmationInput.safeParse({
      ...validPayload,
      itemCount: 0,
    })

    expect(floatCountResult.success).toBe(false)
    expect(zeroCountResult.success).toBe(false)
  })

  test('rejects line item with invalid quantity or negative price', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      items: [
        {
          productId: 'prod_1',
          name: 'Meeovi Pro Wireless Headphones',
          quantity: -1,
          unitPrice: -99.99,
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test('rejects missing orderId', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      orderId: '',
    })

    expect(result.success).toBe(false)
  })

  test('rejects missing receiptUrl', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      receiptUrl: '',
    })

    expect(result.success).toBe(false)
  })

  test('rejects missing receiptUrl field entirely', () => {
    const { receiptUrl, ...rest } = validPayload
    const result = orderConfirmationInput.safeParse(rest)

    expect(result.success).toBe(false)
  })

  test('rejects line item with empty productId', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      items: [
        {
          productId: '',
          name: 'Meeovi Pro Wireless Headphones',
          quantity: 1,
          unitPrice: 99.99,
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test('rejects line item with empty name', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      items: [
        {
          productId: 'prod_1',
          name: '',
          quantity: 1,
          unitPrice: 99.99,
        },
      ],
    })

    expect(result.success).toBe(false)
  })

  test('validates single-item order', () => {
    const result = orderConfirmationInput.safeParse({
      ...validPayload,
      items: [
        {
          productId: 'prod_1',
          name: 'Meeovi Pro Wireless Headphones',
          quantity: 1,
          unitPrice: 149.99,
        },
      ],
      itemCount: 1,
      totalAmount: 149.99,
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.items).toHaveLength(1)
      expect(result.data.totalAmount).toBe(149.99)
    }
  })
})
