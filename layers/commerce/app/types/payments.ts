// layers/commerce/app/types/payments.ts
import type { ID, Maybe, Money, Timestamps } from './common'

export type PaymentMethodCode =
  | 'card'
  | 'paypal'
  | 'stripe'
  | 'klarna'
  | 'apple_pay'
  | 'google_pay'
  | 'bank_transfer'
  | 'cash_on_delivery'
  | 'gift_card'
  | 'store_credit'
  | 'invoice'

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'refunded' | 'partially_refunded' | 'voided' | 'failed' | 'expired'

export interface PaymentMethod {
  code: PaymentMethodCode
  title: string
  description?: string
  isActive?: boolean
  sortOrder?: number
  icon?: string
  instructions?: string
}

export interface PaymentAdditionalInfo {
  key: string
  value: string
}

export interface Payment extends Timestamps {
  id: ID
  orderId?: ID
  method: PaymentMethodCode
  methodTitle?: string
  status: PaymentStatus
  amount: Money
  currencyCode: string
  lastTransId?: string
  ccType?: string
  ccLast4?: string
  ccExpMonth?: number
  ccExpYear?: number
  fraudReview?: boolean
  additionalInfo?: PaymentAdditionalInfo[]
  gatewayResponse?: Record<string, unknown>
}

export interface PaymentProvider {
  getMethods(orderId?: ID, storeId?: ID): Promise<PaymentMethod[]>
  authorize(orderId: ID, method: PaymentMethodCode, amount?: Money): Promise<Payment>
  capture(paymentId: ID, amount?: Money): Promise<Payment>
  refund(paymentId: ID, amount?: Money): Promise<Payment>
  void(paymentId: ID): Promise<Payment>
}
