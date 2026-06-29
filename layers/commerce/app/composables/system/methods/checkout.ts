import type { Simplify } from '../defs/typeHelpers';
import type { SfCart, SfCreateAddressBody, SfCustomerAddress, SfShippingMethods, SfPaymentMethod } from "../models";

export interface SetCustomerEmailExtendedArgs {}
export interface SetCustomerEmailCustomArgs {}

export type SetCustomerEmailArgs = {
  email: string;
  cartId?: string;
  //$extended?: SetCustomerEmailExtendedArgs;
  //$custom?: SetCustomerEmailCustomArgs;
};

export type SetShippingAddress = {
  shippingAddress: SfCreateAddressBody | SfCustomerAddress;
};

export interface SetCartAddressExtendedArgs {}
export interface SetCartAddressCustomArgs {}

export type SetCartAddressArgs = SetShippingAddress & {
  cartId?: string;
  //$extended?: SetCartAddressExtendedArgs;
  //$custom?: SetCartAddressCustomArgs;
};

export interface SetShippingMethodExtendedArgs {}
export interface SetShippingMethodExtendedArgs {}
export interface SetShippingMethodCustomArgs {}

export type SetShippingMethodArgs = {
  shippingMethodId: string;
  cartId?: string;
  //$extended?: SetShippingMethodExtendedArgs;
  //$custom?: SetShippingMethodCustomArgs;
};

export interface SetPaymentMethodExtendedArgs {}
export interface SetPaymentMethodExtendedArgs {}
export interface SetPaymentMethodCustomArgs {}

export type SetPaymentMethodArgs = {
  paymentMethodId?: string;
  paymentMethod?: SfPaymentMethod;
  cartId?: string;
  //$extended?: SetPaymentMethodExtendedArgs;
  //$custom?: SetPaymentMethodExtendedArgs;
};

export interface GetPaymentMethodsExtendedArgs {}
export interface GetPaymentMethodsExtendedArgs {}
export interface GetPaymentMethodsCustomArgs {}

export type GetPaymentMethodsArgs = {
  cartId?: string;
  //$extended?: GetPaymentMethodsExtendedArgs;
  //$custom?: GetPaymentMethodsCustomArgs;
};

export type GetPaymentMethods = (args?: Simplify<GetPaymentMethodsArgs>) => Promise<SfPaymentMethod[]>;

export interface PlaceOrderExtendedArgs {}
export interface PlaceOrderCustomArgs {}

export type PlaceOrderArgs = {
  quoteId?: string;
  paymentMethod?: Record<string, any>;
  shippingMethod?: {
    carrierCode: string;
    methodCode: string;
  };
  billingAddress?: SfCreateAddressBody;
  shippingAddress?: SfCreateAddressBody;
  //$extended?: PlaceOrderExtendedArgs;
  //$custom?: PlaceOrderCustomArgs;
};

export type PlaceOrder = (args?: Simplify<PlaceOrderArgs>) => Promise<{
  order: import("../models/order").SfOrder;
}>;

export type SetCustomerEmail = (args: Simplify<SetCustomerEmailArgs>) => Promise<SfCart>;

export type SetCartAddress = (args: Simplify<SetCartAddressArgs>) => Promise<SfCart>;

export type GetAvailableShippingMethods = () => Promise<SfShippingMethods[]>;

export type SetShippingMethod = (args: Simplify<SetShippingMethodArgs>) => Promise<SfCart>;

export type SetPaymentMethod = (args: Simplify<SetPaymentMethodArgs>) => Promise<SfCart>;
