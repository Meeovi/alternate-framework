import type { InferCustom } from "../defs";
import type { Maybe, SfMoney } from "./shared";

export interface SfShippingMethodCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfShippingMethod {
  carrierCode: string;
  carrierTitle: string;
  methodCode: string;
  methodTitle: string;
  amount: number;
  baseAmount: number;
  available: boolean;
  errorMessage?: string;
  priceExclTax: Maybe<SfMoney>;
  priceInclTax: Maybe<SfMoney>;
  taxAmount: Maybe<SfMoney>;
  deliveryTime?: {
    min: number;
    max: number;
    unit: "day" | "week" | "month";
    description?: string;
  };
  trackingAvailable?: boolean;
  extensionAttributes?: Record<string, unknown>;
  $custom?: SfShippingMethodCustom;
}

export interface SfShippingAddress {
  firstName: string;
  lastName: string;
  street?: string[];
  city: string;
  regionCode?: string;
  region?: string;
  postcode: string;
  countryCode: string;
  telephone?: string;
  email?: string;
}

export interface SfShippingRatesRequest {
  address: SfShippingAddress;
  items: Array<{
    unitPrice: number;
    basePrice: number;
    qty: number;
    rowTotal: number;
    baseRowTotal: number;
    weight: number;
    priceInclTax: number;
    productId: string;
    sku: string;
    name: string;
  }>;
}

export interface SfShippingMethods {
  methods: SfShippingMethod[];
}

export interface SfCreateAddressBody {
  address1: string;
  address2?: Maybe<string>;
  city: string;
  country: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | number;
  postalCode: string;
  regionCode?: string;
  state?: string;
  region?: string;
  saveInAddressBook?: boolean;
  street?: string[];
  prefix?: string;
  suffix?: string;
  company?: string;
  email?: string;
  fax?: string;
  middlename?: string;
  taxvat?: string;
  titleCode?: string;
}
