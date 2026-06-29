import type { Simplify } from '../defs/typeHelpers';
import type { Maybe, SfCart } from "../models";

export interface GetCartExtendedArgs {}
export interface GetCartCustomArgs {}

export type GetCartArgs = {
  cartId?: string;
  //$extended?: GetCartExtendedArgs;
  //$custom?: GetCartCustomArgs;
};

export interface AddCartLineItemExtendedArgs {}
export interface AddCartLineItemCustomArgs {}

export interface CartItemOptions {
  id: string;
  title: string;
  type: string;
  values: Array<{
    id: string;
    title: string;
    price: number;
    priceType: 'fixed' | 'percent';
  }>;
}

export interface AddCartLineItemArgsBase {
  productId: string;
  sku?: Maybe<string>;
  qty?: number;
  cartId?: string;
  quoteId?: string;
  productType?: string;
  extensionAttributes?: {
    stockItem?: {
      itemId?: string;
      stockId?: string;
      qty?: number;
      isInStock?: boolean;
    };
    downloadableProductLinks?: string[];
    bundleProductOptions?: CartItemOptions[];
    configurableProductOptions?: {
      configurableItemId: number;
      valueIndex: number;
    }[];
  };
}

export interface AddCartLineItemArgs extends AddCartLineItemArgsBase {
  customerGroupId?: string;
  stockFilter?: boolean;
}

export interface UpdateCartLineItemExtendedArgs {}
export interface UpdateCartLineItemCustomArgs {}

export interface UpdateCartLineItemArgsBase {
  cartItemId: string;
  qty: number;
  cartId?: string;
}

export interface UpdateCartLineItemArgs extends UpdateCartLineItemArgsBase {
  productOptions?: CartItemOptions[];
}

export interface RemoveCartLineItemExtendedArgs {}
export interface RemoveCartLineItemCustomArgs {}

export type RemoveCartLineItemArgs = {
  lineItemId: string;
  cartId?: string;
  //$extended?: RemoveCartLineItemExtendedArgs;
  //$custom?: RemoveCartLineItemCustomArgs;
};

export interface ApplyCouponToCartExtendedArgs {}
export interface ApplyCouponToCartCustomArgs {}

export type ApplyCouponToCartArgs = {
  couponCode: string;
  cartId?: string;
  //$extended?: ApplyCouponToCartExtendedArgs;
  //$custom?: ApplyCouponToCartCustomArgs;
};

export interface RemoveCouponFromCartExtendedArgs {}
export interface RemoveCouponFromCartCustomArgs {}

export type RemoveCouponFromCartArgs = {
  couponId: string;
  cartId?: string;
  //$extended?: RemoveCouponFromCartExtendedArgs;
  //$custom?: RemoveCouponFromCartCustomArgs;
};

export interface SplitCartExtendedArgs {}
export interface SplitCartCustomArgs {}

export type SplitCartArgs = {
  customerId: string;
  storeId: string;
  websiteId: string;
  regionCode: string;
  postcode: string;
  cartId?: string;
  //$extended?: SplitCartExtendedArgs;
  //$custom?: SplitCartCustomArgs;
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

export type SplitCart = (args: Simplify<SplitCartArgs>) => Promise<SfCart>;
