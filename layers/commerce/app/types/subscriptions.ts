// layers/commerce/app/types/subscriptions.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'
import type { Subscription, SubscriptionPlan } from './products'

export type SubscriptionStatus = Subscription['status']

export interface SubscriptionBillingCycle extends Timestamps {
  id: ID
  subscriptionId: ID
  orderId?: ID
  scheduledAt: string | Date
  processedAt?: Maybe<string | Date>
  amount: Money
  status: 'scheduled' | 'success' | 'failed' | 'skipped'
  attempt?: number
}

export interface SubscriptionUpdateInput {
  status?: SubscriptionStatus
  quantity?: number
  nextBillingAt?: string | Date
  planId?: ID
}

export interface SubscriptionSearchParams extends PaginationParams {
  customerId?: ID
  productId?: ID
  status?: SubscriptionStatus
}

export interface SubscriptionProvider {
  getSubscriptions(params?: SubscriptionSearchParams): Promise<Paginated<Subscription>>
  getSubscriptionById(id: ID): Promise<Maybe<Subscription>>
  getPlans(productId?: ID): Promise<SubscriptionPlan[]>
  subscribe(payload: { productId: ID; customerId: ID; planId?: ID; quantity?: number }): Promise<Subscription>
  updateSubscription(id: ID, input: SubscriptionUpdateInput): Promise<Subscription>
  cancelSubscription(id: ID, reason?: string): Promise<Subscription>
  pauseSubscription(id: ID): Promise<Subscription>
  resumeSubscription(id: ID): Promise<Subscription>
  getBillingHistory(subscriptionId: ID): Promise<SubscriptionBillingCycle[]>
}
