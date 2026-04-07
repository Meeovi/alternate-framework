import { Maybe } from "alternate-gateway/core";
import { SfAddress } from "~/composables";

export interface Address extends SfAddress {
  streetNumber: Maybe<string>;
  phone: Maybe<string>;
  streetName: Maybe<string>;
}

export type CheckoutAddressProps = {
  type: 'billingAddress' | 'shippingAddress';
  heading: string;
  description: string;
  buttonText: string;
  savedAddress?: Maybe<SfAddress>;
};
