// layers/commerce/app/types/returns.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type ReturnStatus =
  | 'pending'
  | 'authorized'
  | 'received'
  | 'approved'
  | 'rejected'
  | 'refunded'
  | 'closed'

export type ReturnType = 'refund' | 'exchange' | 'store_credit'

export type ReturnItemCondition = 'new' | 'opened' | 'damaged' | 'defective' | 'wrong_item'

export interface ReturnItem extends Timestamps {
  id: ID
  returnId: ID
  productId: ID
  sku: string
  name: string
  qty: number
  price: Money
  reason?: string
  condition?: ReturnItemCondition
  resolution?: ReturnType
  status?: ReturnStatus
}

export interface Return extends Timestamps {
  id: ID
  returnNumber?: string
  orderId?: ID
  orderIncrementId?: string
  customerId?: Maybe<ID>
  customerEmail?: string
  status: ReturnStatus
  type: ReturnType
  reason?: string
  comment?: string
  items: ReturnItem[]
  refundAmount?: Money
  isProcessed?: boolean
}

export interface ReturnSearchParams extends PaginationParams {
  orderId?: ID
  customerId?: ID
  status?: ReturnStatus
}

export interface CreateReturnInput {
  orderId: ID
  customerId?: ID
  type?: ReturnType
  reason?: string
  items: Array<{
    productId: ID
    sku: string
    qty: number
    reason?: string
    condition?: ReturnItemCondition
  }>
  comment?: string
}

export interface ReturnProvider {
  getReturns(params?: ReturnSearchParams): Promise<Paginated<Return>>
  getReturnById(id: ID): Promise<Maybe<Return>>
  createReturn(input: CreateReturnInput): Promise<Return>
}
