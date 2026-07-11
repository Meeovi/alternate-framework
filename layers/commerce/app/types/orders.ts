// layers/commerce/app/types/orders.ts
import type { Address, ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'on_hold'
  | 'complete'
  | 'closed'
  | 'canceled'
  | 'fraud'
  | 'payment_review'

export type OrderState = 'new' | 'pending_payment' | 'paid' | 'shipped' | 'delivered' | 'refunded' | 'canceled'

export interface OrderItem extends Timestamps {
  id: ID
  orderId: ID
  productId: ID
  sku: string
  name: string
  type?: string
  qty: number
  price: Money
  originalPrice?: Money
  discountAmount?: Money
  taxAmount?: Money
  rowTotal: Money
  options?: Record<string, unknown>
  parentItemId?: ID
}

export interface OrderTotals {
  subtotal: Money
  discount: Money
  shipping: Money
  tax: Money
  grandTotal: Money
  paid: Money
  due: Money
  refunded?: Money
}

export interface Order extends Timestamps {
  id: ID
  incrementId?: string
  status: OrderStatus
  state?: OrderState
  storeId?: ID
  customerId?: Maybe<ID>
  customerEmail?: string
  customerFirstName?: string
  customerLastName?: string
  isGuest?: boolean
  currencyCode: string
  items: OrderItem[]
  totals: OrderTotals
  shippingAddress?: Address
  billingAddress?: Address
  shippingMethod?: string
  shippingDescription?: string
  paymentMethod?: string
  couponCode?: Maybe<string>
  isVirtual?: boolean
  notes?: string
  externalId?: string
}

export interface OrderSearchParams extends PaginationParams {
  customerId?: ID
  status?: OrderStatus
  storeId?: ID
  from?: string
  to?: string
  search?: string
}

export interface UseOrdersState {
  data: Maybe<Paginated<Order>>
  loading: boolean
}

export interface OrderProvider {
  getOrders(params?: OrderSearchParams): Promise<Paginated<Order>>
  getOrderById(id: ID): Promise<Maybe<Order>>
  getOrderByIncrementId(incrementId: string): Promise<Maybe<Order>>
  cancelOrder(id: ID, reason?: string): Promise<Maybe<Order>>
}
