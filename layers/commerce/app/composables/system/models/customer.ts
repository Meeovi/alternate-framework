import type { InferCustom } from "../defs";
import type { SfAddress, SfId, SfCustomerGroup } from "./shared";

export interface SfCustomerCustom extends InferCustom<"normalizeCustomer"> {}

export interface SfCustomer {
  id: SfId;
  email: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  suffix?: string;
  prefix?: string;
  dateOfBirth?: string;
  gender?: SfGender;
  taxClassId?: string;
  taxClassName?: string;
  storeId?: string;
  websiteId?: string;
  websiteName?: string;
  groupId?: string;
  groupName?: string;
  addresses: SfAddress[];
  defaultShipping?: string;
  defaultBilling?: string;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: {
    isSubscribed: boolean;
    newsletterId?: string;
  };
  $custom?: SfCustomerCustom;
}

export interface SfCustomerAddress extends SfAddress {
  id: SfId;
  customerId?: SfId;
  isDefaultBilling: boolean;
  isDefaultShipping: boolean;
  extensionAttributes?: {
    isSubscribed: boolean;
    newsletterId?: string;
    company?: string;
    vatId?: string;
  };
}

export interface SfCustomerGroup extends SfCustomerGroup {
  customerCount: number;
}
