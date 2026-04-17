import type { Simplify } from '../defs/typeHelpers';
import type { Maybe, SfCart } from "../models";

export interface GetCartExtendedArgs {}
export interface GetCartCustomArgs {}

export type GetCartArgs = {
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: GetCartExtendedArgs;
  //$custom?: GetCartCustomArgs;
};

export interface AddCartLineItemExtendedArgs {}
export interface AddCartLineItemCustomArgs {}

export type AddCartLineItemArgs = {
  /**
   * Product unique identifier - for commercetools it's a SKU, for sap it's a product code
   */
  productId: string;
  sku: Maybe<string>;
  /**
   * Quantity of product to add to cart
   * @default 1
   */
  quantity?: number;
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: AddCartLineItemExtendedArgs;
  //$custom?: AddCartLineItemCustomArgs;
};

export interface UpdateCartLineItemExtendedArgs {}
export interface UpdateCartLineItemCustomArgs {}

export type UpdateCartLineItemArgs = {
  lineItemId: string;
  quantity: number;
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: UpdateCartLineItemExtendedArgs;
  //$custom?: UpdateCartLineItemCustomArgs;
};

export interface RemoveCartLineItemExtendedArgs {}
export interface RemoveCartLineItemCustomArgs {}

export type RemoveCartLineItemArgs = {
  lineItemId: string;
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: RemoveCartLineItemExtendedArgs;
  //$custom?: RemoveCartLineItemCustomArgs;
};

export interface ApplyCouponToCartExtendedArgs {}
export interface ApplyCouponToCartCustomArgs {}

export type ApplyCouponToCartArgs = {
  couponCode: string;
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: ApplyCouponToCartExtendedArgs;
  //$custom?: ApplyCouponToCartCustomArgs;
};

export interface RemoveCouponFromCartExtendedArgs {}
export interface RemoveCouponFromCartCustomArgs {}

export type RemoveCouponFromCartArgs = {
  /**
   * Don't confuse it with coupon code. It can be retrieved from cart.appliedCoupons
   */
  couponId: string;
  /**
   * Unique identifier of cart
   */
  cartId?: string;
  //$extended?: RemoveCouponFromCartExtendedArgs;
  //$custom?: RemoveCouponFromCartCustomArgs;
};

/**
 * Get all information about customer's cart
 */
export type GetCart = (args?: Simplify<GetCartArgs>) => Promise<SfCart>;

/**
 * Add product to cart
 */
export type AddCartLineItem = (args: Simplify<AddCartLineItemArgs>) => Promise<SfCart>;

/**
 * Update product quantity in cart
 */
export type UpdateCartLineItem = (args: Simplify<UpdateCartLineItemArgs>) => Promise<SfCart>;

/**
 * Remove product from cart
 */
export type RemoveCartLineItem = (args: Simplify<RemoveCartLineItemArgs>) => Promise<SfCart>;

/**
 * Apply a coupon to cart to get a discount
 */
export type ApplyCouponToCart = (args: Simplify<ApplyCouponToCartArgs>) => Promise<SfCart>;

export type RemoveCouponFromCart = (args: Simplify<RemoveCouponFromCartArgs>) => Promise<SfCart>;
