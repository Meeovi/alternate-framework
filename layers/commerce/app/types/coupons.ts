// layers/commerce/app/types/coupons.ts
import type { ID, Maybe, Money, Paginated, PaginationParams, Timestamps } from './common'

export type CouponType = 'percent' | 'fixed' | 'free_shipping' | 'buy_x_get_y'

export type CouponScope = 'global' | 'customer' | 'product' | 'category' | 'shipping'

export type CouponStatus = 'active' | 'inactive' | 'expired' | 'scheduled' | 'used'

export interface CouponRule extends Timestamps {
  id: ID
  name: string
  description?: string
  type: CouponType
  status: CouponStatus
  code?: string // for single-use generated codes
  codes?: string[] // pool of generated codes
  discountAmount: number // percent (0-100) or fixed amount
  maxDiscountAmount?: Money
  minSubtotal?: Money
  appliesTo: CouponScope
  productIds?: ID[]
  categoryIds?: ID[]
  customerIds?: ID[]
  usesPerCoupon?: number
  usesPerCustomer?: number
  timesUsed?: number
  startDate?: Maybe<string | Date>
  endDate?: Maybe<string | Date>
  stackable?: boolean
  freeShipping?: boolean
  stopFurtherRules?: boolean
}

export interface AppliedCoupon {
  code: string
  ruleId: ID
  type: CouponType
  discountAmount: Money
  label?: string
}

export interface CouponSearchParams extends PaginationParams {
  status?: CouponStatus
  type?: CouponType
  productId?: ID
  customerId?: ID
}

export interface CouponProvider {
  getCoupons(params?: CouponSearchParams): Promise<Paginated<CouponRule>>
  getCouponById(id: ID): Promise<Maybe<CouponRule>>
  validateCoupon(code: string, cartTotal?: Money, customerId?: ID): Promise<Maybe<AppliedCoupon>>
  generateCodes(ruleId: ID, quantity: number, length?: number): Promise<string[]>
}
