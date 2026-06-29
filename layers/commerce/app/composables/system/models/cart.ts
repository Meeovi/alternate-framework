import type { InferCustom } from "../defs";
import type { SfShippingMethod } from "./checkout";
import type {
  Maybe,
  SfAddress,
  SfAttribute,
  SfCoupon,
  SfDiscountablePrice,
  SfId,
  SfImage,
  SfMoney,
} from "./shared";

export interface SfCartLineItemCustom extends InferCustom<"normalizeCartLineItem"> {}

export interface SfCartLineItem {
  attributes: SfAttribute[];
  productId: SfId;
  id: SfId;
  parentItemId?: string;
  image: Maybe<SfImage>;
  name: Maybe<string>;
  quantity: number;
  sku: Maybe<string>;
  slug: string;
  productType?: string;
  currency: string;
  price: SfMoney;
  basePrice: SfMoney;
  finalPrice: SfMoney;
  discountAmount: SfMoney;
  taxAmount: SfMoney;
  taxPercent: number;
  discountPercent: number;
  rowTotal: SfMoney;
  rowTotalInclTax: SfMoney;
  totalPrice: SfMoney;
  unitPrice: Maybe<SfDiscountablePrice>;
  quantityLimit: Maybe<number>;
  freeShipping: boolean;
  message?: string;
  appToTotal?: string;
  isQtyDecimal?: boolean;
  noDiscount?: boolean;
  weeeTaxApplied?: string;
  weeeTaxAppliedAmount?: number;
  weeeTaxDisposition?: number;
  weeeTaxRowDisposition?: number;
  productOption?: {
    id: string;
    title: string;
    type: "select" | "radio" | "checkbox" | "multi_select";
    values: Array<{
      id: string;
      title: string;
      price: number;
      priceType: "fixed" | "percent";
    }>;
  };
  children?: SfCartLineItem[];
  extensionAttributes?: {
    downloadableProductLinks?: string[];
    giftCard?: Record<string, unknown>;
  };
  $custom?: SfCartLineItemCustom;
}

export interface SfCartCouponCustom extends InferCustom<"normalizeCartCoupon"> {}

export interface SfCartCoupon {
  code: string;
  id: string;
  name: Maybe<string>;
  $custom?: SfCartCouponCustom;
}

export interface SfCartAddressCustom extends InferCustom<"normalizeCartAddress"> {}

export interface SfCartAddress extends SfAddress {
  id: SfId;
  type: "shipping" | "billing" | "both";
  $custom?: SfCartAddressCustom;
}

export interface SfCartTotal {
  subtotal: SfMoney;
  subtotalExclTax: SfMoney;
  subtotalInclTax: SfMoney;
  discount: SfMoney;
  grandTotal: SfMoney;
  tax: SfMoney;
  shipping: SfMoney;
  shippingExclTax: SfMoney;
  shippingInclTax: SfMoney;
  couponDiscount: SfMoney;
  cartDiscount: SfMoney;
  weeeTax: SfMoney;
  rounding: SfMoney;
  baseCurrencyCode: string;
  storeCurrencyCode: string;
  quoteCurrencyCode: string;
}

export interface SfCartCustom extends InferCustom<"normalizeCart"> {}

export interface SfCart {
  appliedCoupons: SfCartCoupon[];
  appliedTaxes?: Array<{
    code: string;
    title: string;
    percent: number;
    amount: SfMoney;
  }>;
  appliedRuleIds: string[];
  billingAddress: Maybe<SfAddress>;
  bonusDiscountAmount: number;
  couponCode?: string;
  createdAt: string;
  currency: SfCurrency;
  customerEmail: Maybe<string>;
  customerId?: string;
  customerGroupId?: string;
  customerIsGuest: boolean;
  discountAmount: SfMoney;
  giftMessage?: string;
  giftMessageId: number;
  giftRegistryItemId: number;
  giftRegistryListId: number;
  grandTotal: SfMoney;
  items: SfCartLineItem[];
  lineCount: number;
  itemsQty: number;
  storeId: string;
  websiteId: string;
  id: SfId;
  isActive: boolean;
  isVirtual: boolean;
  itemsCount?: number;
  reservation?: string;
  shippingAddress: Maybe<SfAddress>;
  shippingMethod: Maybe<SfShippingMethod>;
  shippingAmount: SfMoney;
  shippingDescription?: string;
  shippingTaxAmount: SfMoney;
  subtotal: SfMoney;
  taxAmount: SfMoney;
  totalSegments?: Array<{
    code: string;
    title: string;
    amount: SfMoney;
  }>;
  totals: Maybe<SfCartTotal>;
  updatedAt: string;
  validationMessages?: Array<{
    code: string;
    text: string;
  }>;
  $custom?: SfCartCustom;
}
