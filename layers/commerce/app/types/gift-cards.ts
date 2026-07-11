// layers/commerce/app/types/gift-cards.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type GiftCardStatus = 'active' | 'inactive' | 'redeemed' | 'expired' | 'pending'

export interface GiftCard extends Timestamps {
  id: ID
  code: string
  productId?: ID
  initialValue: Money
  balance: Money
  currencyCode: string
  status: GiftCardStatus
  senderName?: string
  senderEmail?: string
  recipientName?: string
  recipientEmail?: string
  message?: string
  expiresAt?: Maybe<string | Date>
  orderId?: ID
  isPhysical?: boolean
}

export interface GiftCardTransaction extends Timestamps {
  id: ID
  giftCardId: ID
  type: 'issue' | 'redeem' | 'refund' | 'expire' | 'adjust'
  amount: Money
  balanceAfter: Money
  orderId?: ID
  customerId?: Maybe<ID>
  comment?: string
}

export interface GiftCardSearchParams extends PaginationParams {
  status?: GiftCardStatus
  customerId?: ID
  code?: string
}

export interface IssueGiftCardInput {
  productId?: ID
  amount: Money
  senderName?: string
  senderEmail?: string
  recipientName?: string
  recipientEmail?: string
  message?: string
  expiresAt?: Maybe<string | Date>
}

export interface GiftCardProvider {
  getGiftCards(params?: GiftCardSearchParams): Promise<Paginated<GiftCard>>
  getGiftCardByCode(code: string): Promise<Maybe<GiftCard>>
  issueGiftCard(input: IssueGiftCardInput): Promise<GiftCard>
  redeemGiftCard(code: string, amount: Money, customerId?: ID): Promise<GiftCard>
  balance(code: string): Promise<Maybe<Money>>
}
