import type { InferCustom } from "../defs";
import type { SfShippingMethod } from "./checkout";
import type {
  Maybe,
  SfAddress,
  SfAttribute,
  SfDiscountablePrice,
  SfId,
  SfImage,
  SfMoney,
} from "./shared";

export interface SfCartLineItemCustom extends InferCustom<"normalizeCartLineItem"> {}

export interface SfCartLineItem {
  attributes: SfAttribute[];
  productId: SfId;
  /**
   * ID of the cart's line item
   */
  id: SfId;
  image: Maybe<SfImage>;
  name: Maybe<string>;
  quantity: number;
  sku: Maybe<string>;
  slug: string;
  /**
   * Product of quantity and unitPrice
   */
  totalPrice: Maybe<SfMoney>;
  unitPrice: Maybe<SfDiscountablePrice>;
  quantityLimit: Maybe<number>;
  $custom?: SfCartLineItemCustom;
}

export interface SfCartCouponCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfCartCoupon {
  code: string;
  id: string;
  name: Maybe<string>;
  $custom?: SfCartCouponCustom;
}

export interface SfCartCustom extends InferCustom<"normalizeCart"> {}

export interface SfCart {
  appliedCoupons: SfCartCoupon[];
  /**
   * @default null
   */
  billingAddress: Maybe<SfAddress>;
  /**
   * Active customer's email. Required to complete the checkout
   * @default null
   */
  customerEmail: Maybe<string>;
  id: SfId;
  /**
   * Shipping address is required to get available shipping methods
   * @default null
   */
  lineItems: SfCartLineItem[];
  shippingAddress: Maybe<SfAddress>;
  /**
   * Required to complete the checkout. To get available methods use `getAvailableShippingMethods`
   * @default null
   */
  shippingMethod: Maybe<SfShippingMethod>;
  /**
   * Difference of `subtotalRegularPrice` and discounts applied to line items before providing coupons.
   * If none of the products are discounted, price will be equal to `subtotalRegularPrice`
   */
  subtotalDiscountedPrice: SfMoney;
  /**
   * Total regular price of all line items (coupons, taxes, shipping excluded)
   */
  subtotalRegularPrice: SfMoney;
  totalCouponDiscounts: SfMoney;
  /**
   * Total count of all line items and their's quantities in cart
   */
  totalItems: number;
  /**
   * Total cart price (discounts, taxes, shipping included)
   */
  totalPrice: SfMoney;
  /**
   * Calculated after applying shipping method
   * @default null
   */
  totalShippingPrice: Maybe<SfMoney>;
  totalTax: SfMoney;
  $custom?: SfCartCustom;
}
