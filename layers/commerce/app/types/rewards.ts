// layers/commerce/app/types/rewards.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type RewardAction =
  | 'purchase' // earn points per currency spent
  | 'registration'
  | 'review'
  | 'referral'
  | 'birthday'
  | 'newsletter'
  | 'redeem'

export type RewardTransactionType = 'earn' | 'redeem' | 'expire' | 'adjust'

export type RewardTierStatus = 'active' | 'inactive'

export interface RewardPointTransaction extends Timestamps {
  id: ID
  customerId: ID
  type: RewardTransactionType
  action?: RewardAction
  points: number // positive for earn, negative for redeem
  balance: number // running balance after this transaction
  orderId?: ID
  comment?: string
  expiresAt?: Maybe<string | Date>
}

export interface RewardTier extends Timestamps {
  id: ID
  name: string
  status: RewardTierStatus
  minPoints: number
  maxPoints?: number
  discountPercent?: number
  benefits?: string[]
}

export interface RewardAccount extends Timestamps {
  id: ID
  customerId: ID
  pointsBalance: number
  pointsEarned: number
  pointsRedeemed: number
  currencyBalance?: Money
  tierId?: Maybe<ID>
  lifetimePoints?: number
}

export interface RewardProgram extends Timestamps {
  id: ID
  name: string
  pointsPerCurrency: number // points earned per unit currency spent
  currencyPerPoint?: number // currency value of a single point when redeeming
  minimumRedeemable?: number
  maximumRedeemPercent?: number // cap on % of order redeemable with points
  expirationDays?: number
  tiers?: RewardTier[]
}

export interface RewardSearchParams extends PaginationParams {
  customerId?: ID
  type?: RewardTransactionType
}

export interface RewardProvider {
  getAccount(customerId: ID): Promise<Maybe<RewardAccount>>
  getTransactions(params?: RewardSearchParams): Promise<Paginated<RewardPointTransaction>>
  earn(customerId: ID, points: number, action?: RewardAction, referenceId?: ID): Promise<RewardPointTransaction>
  redeem(customerId: ID, points: number, orderId?: ID): Promise<RewardPointTransaction>
}
