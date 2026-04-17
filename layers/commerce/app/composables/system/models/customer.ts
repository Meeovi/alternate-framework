import type { InferCustom } from "../defs";
import type { SfAddress, SfId } from "./shared";

export interface SfCustomerCustom extends InferCustom<"normalizeCustomer"> {}

export interface SfCustomer {
  id: SfId;
  email: string;
  firstName: string;
  lastName: string;
  $custom?: SfCustomerCustom;
}

export interface SfCustomerAddress extends SfAddress {
  id: SfId;
}
