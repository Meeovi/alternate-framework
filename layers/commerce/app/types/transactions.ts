// layers/commerce/app/types/transactions.ts
import type { ID, Maybe, Money, Timestamps } from './common'

export type TransactionType = 'authorization' | 'capture' | 'refund' | 'void' | 'disbursement' | 'payout' | 'fee'

export type TransactionStatus = 'pending' | 'success' | 'failure' | 'abandoned' | 'canceled'

export interface Transaction extends Timestamps {
  id: ID
  txnId: string
  orderId?: ID
  paymentId?: ID
  parentTxnId?: Maybe<string>
  type: TransactionType
  status: TransactionStatus
  amount: Money
  currencyCode: string
  paymentMethod?: string
  gateway?: string
  isClosed?: boolean
  additionalInfo?: Record<string, unknown>
}

export interface TransactionSearchParams {
  orderId?: ID
  paymentId?: ID
  type?: TransactionType
  status?: TransactionStatus
  from?: string
  to?: string
}

export interface TransactionProvider {
  getTransactions(params?: TransactionSearchParams): Promise<Transaction[]>
  getTransactionById(id: ID): Promise<Maybe<Transaction>>
}
