import type { InferCustom } from "../defs";
import type { SfShippingMethod } from "./checkout";
import type { Maybe, SfAddress, SfAttribute, SfId, SfImage, SfMoney } from "./shared";

export interface SfOrderLineItemCustom extends InferCustom<"normalizeOrderLineItem"> {}

export interface SfOrderLineItem {
  id: SfId;
  attributes: SfAttribute[];
  unitPrice: SfMoney;
  totalPrice: SfMoney;
  quantity: number;
  image: Maybe<SfImage>;
  productId: SfId;
  productName: string;
  sku: Maybe<string>;
  $custom?: SfOrderLineItemCustom;
}

export interface SfOrderCustom extends InferCustom<"normalizeOrder"> {}

export interface SfOrder {
  id: SfId;
  orderDate: string;
  status: string;
  lineItems: SfOrderLineItem[];
  subtotalPrice: SfMoney;
  totalShippingPrice: SfMoney;
  totalTax: SfMoney;
  totalPrice: SfMoney;
  shippingAddress: SfAddress;
  billingAddress: Maybe<SfAddress>;
  shippingMethod: SfShippingMethod;
  paymentMethod: string;
  $custom?: SfOrderCustom;
}

export interface SfOrderListItemCustom extends InferCustom<"normalizeOrder"> {}

export interface SfOrderListItem
  extends Pick<SfOrder, "id" | "orderDate" | "totalPrice" | "status"> {
  $custom?: SfOrderListItemCustom;
}
