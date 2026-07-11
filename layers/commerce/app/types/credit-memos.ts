// layers/commerce/app/types/credit-memos.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type CreditMemoState = 'pending' | 'refunded' | 'closed' | 'canceled'

export interface CreditMemoItem extends Timestamps {
  id: ID
  creditMemoId: ID
  productId: ID
  sku: string
  name: string
  qty: number
  price: Money
  discountAmount?: Money
  taxAmount?: Money
  rowTotal: Money
}

export interface CreditMemoAdjustment {
  label: string
  amount: Money
}

export interface CreditMemo extends Timestamps {
  id: ID
  incrementId?: string
  orderId?: ID
  invoiceId?: Maybe<ID>
  state: CreditMemoState
  storeId?: ID
  customerId?: Maybe<ID>
  customerEmail?: string
  currencyCode: string
  items: CreditMemoItem[]
  adjustmentPositive?: Money
  adjustmentNegative?: Money
  shippingAmount?: Money
  discountAmount?: Money
  taxAmount?: Money
  grandTotal: Money
  baseGrandTotal?: Money
  adjustments?: CreditMemoAdjustment[]
  reason?: string
  refundToStoreCredit?: boolean
  transactionId?: Maybe<string>
}

export interface CreditMemoSearchParams extends PaginationParams {
  orderId?: ID
  customerId?: ID
  state?: CreditMemoState
}

export interface CreateCreditMemoInput {
  orderId: ID
  invoiceId?: ID
  items: Array<{ orderItemId: ID; qty: number }>
  adjustmentPositive?: number
  adjustmentNegative?: number
  shippingAmount?: number
  reason?: string
  refundToStoreCredit?: boolean
}

export interface CreditMemoProvider {
  getCreditMemos(params?: CreditMemoSearchParams): Promise<Paginated<CreditMemo>>
  getCreditMemoById(id: ID): Promise<Maybe<CreditMemo>>
  createCreditMemo(input: CreateCreditMemoInput): Promise<CreditMemo>
}
