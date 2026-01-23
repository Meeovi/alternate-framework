import type { Simplify } from "type-fest";
import type { SfCart, SfCreateAddressBody, SfCustomerAddress, SfShippingMethods } from "../models";

export interface SetCustomerEmailExtendedArgs {}
export interface SetCustomerEmailCustomArgs {}

export type SetCustomerEmailArgs = {
  email: string;
  //$extended?: SetCustomerEmailExtendedArgs;
  //$custom?: SetCustomerEmailCustomArgs;
};

export type SetShippingAddress = {
  shippingAddress: SfCreateAddressBody | SfCustomerAddress;
};

export interface SetCartAddressExtendedArgs {}
export interface SetCartAddressCustomArgs {}

export type SetCartAddressArgs = SetShippingAddress & {
  //$extended?: SetCartAddressExtendedArgs;
  //$custom?: SetCartAddressCustomArgs;
};

export interface SetShippingMethodExtendedArgs {}
export interface SetShippingMethodCustomArgs {}

export type SetShippingMethodArgs = {
  shippingMethodId: string;
  //$extended?: SetShippingMethodExtendedArgs;
  //$custom?: SetShippingMethodCustomArgs;
};

/**
 * Set an email of active customer
 */
export type SetCustomerEmail = (args: Simplify<SetCustomerEmailArgs>) => Promise<SfCart>;

/**
 * Set customers adddress
 * @example Set shipping address first
 * setCartAddress({ shippingAddress: { ... } })
 */
export type SetCartAddress = (args: Simplify<SetCartAddressArgs>) => Promise<SfCart>;

/**
 * Get available shipping methods based on customer's shipping address
 */
export type GetAvailableShippingMethods = () => Promise<SfShippingMethods>;

/**
 * Choose a one shipping method from available shipping methods
 */
export type SetShippingMethod = (args: Simplify<SetShippingMethodArgs>) => Promise<SfCart>;
