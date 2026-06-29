import type { InferCustom } from "../defs";
import type { SfShippingMethod } from "./checkout";
import type { Maybe, SfAddress, SfAttribute, SfId, SfImage, SfMoney } from "./shared";

export interface SfOrderLineItemCustom extends InferCustom<"normalizeOrderLineItem"> {}

export interface SfOrderLineItem {
  id: SfId;
  attributes: SfAttribute[];
  parentItemId?: string;
  productId: SfId;
  productSku: string;
  productName: string;
  productWeight?: number;
  productType: string;
  quantity: number;
  qtyCanceled: number;
  qtyInvoiced: number;
  qtyRefunded: number;
  qtyReturned: number;
  qtyShipped: number;
  basePrice: SfMoney;
  baseDiscountAmount: SfMoney;
  baseDiscountInvoiced: SfMoney;
  baseDiscountRefunded: SfMoney;
  baseOriginalPrice: SfMoney;
  basePriceInclTax: SfMoney;
  baseRowTotal: SfMoney;
  baseRowTotalInclTax: SfMoney;
  baseTaxAmount: SfMoney;
  baseTaxInvoiced: SfMoney;
  baseTaxRefunded: SfMoney;
  baseWeeeTaxAppliedAmount: number;
  baseWeeeTaxDisposition: number;
  baseWeeeTaxRowDisposition: number;
  discountAmount: SfMoney;
  discountInvoiced: SfMoney;
  discountRefunded: SfMoney;
  freeShipping: boolean;
  image: Maybe<SfImage>;
  isVirtual: boolean;
  extensionAttributes?: {
    taxInvoiced?: SfMoney;
    taxRefunded?: SfMoney;
    weeeTaxApplied?: Array<{
      title: string;
      amount: SfMoney;
      baseAmount: SfMoney;
      dispositionAmount: number;
      baseDispositionAmount: number;
    }>;
  };
  giftMessageId?: string;
  giftMessage?: string;
  giftRegistryItemId?: string;
  orderId: string;
  price: SfMoney;
  priceInclTax: SfMoney;
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
  rowTotal: SfMoney;
  rowTotalInclTax: SfMoney;
  rowWeight: number;
  sku: string;
  taxes: Array<{
    amount: SfMoney;
    baseAmount: SfMoney;
    code: string;
    title: string;
    percent: number;
    priority: number;
  }>;
  unitPrice: SfMoney;
  unitPriceInclTax: SfMoney;
  weeeTaxApplied: string;
  weeeTaxAppliedAmount: number;
  weeeTaxDisposition: number;
  weeeTaxRowDisposition: number;
  $custom?: SfOrderLineItemCustom;
}

export interface SfOrderCustom extends InferCustom<"normalizeOrder"> {}

export interface SfOrder {
  id: SfId;
  orderNumber?: string;
  incrementId?: string;
  status: SfOrderStatus;
  state: SfOrderState;
  customerId?: string;
  customerEmail: string;
  customerFirstname?: string;
  customerLastname?: string;
  customerGroupId?: string;
  storeId: string;
  storeName: string;
  websiteId: string;
  quoteId: string;
  couponCode?: string;
  discountDescription?: string;
  discountAmount: SfMoney;
  grandTotal: SfMoney;
  shippingAmount: SfMoney;
  shippingDescription: string;
  shippingMethod: string;
  shippingTaxAmount: SfMoney;
  subtotal: SfMoney;
  subtotalInclTax: SfMoney;
  taxAmount: SfMoney;
  totalDue: SfMoney;
  totalPaid: SfMoney;
  totalRefunded: SfMoney;
  totalQtyOrdered: number;
  totalQtyInvoiced: number;
  totalQtyShipped: number;
  totalQtyReturned: number;
  totalQtyCanceled: number;
  isVirtual: boolean;
  items: SfOrderLineItem[];
  payment: {
    method: string;
    additionalInformation: Record<string, unknown>;
    amountOrdered: SfMoney;
    amountPaid: SfMoney;
    amountRefunded: SfMoney;
    shippingAmount: SfMoney;
    taxAmount: SfMoney;
  };
  billingAddress: SfAddress;
  shippingAddress: SfAddress;
  shippingMethod?: Maybe<SfShippingMethod>;
  orderDate: string;
  updatedAt: string;
  createdAt: string;
  extensionAttributes?: {
    paymentAdditionalInfo?: Array<Record<string, unknown>>;
    appliedTaxes?: Array<{
      code: string;
      title: string;
      percent: number;
      amount: SfMoney;
    }>;
    shippingAssignments?: Array<{
      shipping: {
        address: SfAddress;
        method: string;
      };
      items: SfOrderLineItem[];
    }>;
  };
  $custom?: SfOrderCustom;
}

export interface SfOrderListItemCustom extends InferCustom<"normalizeOrder"> {}

export interface SfOrderListItem
  extends Pick<
          SfOrder,
          "id" | "orderNumber" | "incrementId" | "orderDate" | "status" | "state" | "grandTotal" | "totalQtyOrdered" | "customerEmail"
        > {
  $custom?: SfOrderListItemCustom;
}

export interface SfInvoiceCustom extends InferCustom<"normalizeInvoice"> {}

export interface SfInvoice {
  id: SfInvoiceId;
  incrementId?: string;
  orderId: SfOrderId;
  orderIncrementId?: string;
  state: SfInvoiceState;
  subtotal: SfMoney;
  subtotalInclTax: SfMoney;
  shippingAmount: SfMoney;
  shippingInclTax: SfMoney;
  shippingTaxAmount: SfMoney;
  discountAmount: SfMoney;
  discountDescription?: string;
  grandTotal: SfMoney;
  taxAmount: SfMoney;
  totalQty: number;
  baseSubtotal: SfMoney;
  baseSubtotalInclTax: SfMoney;
  baseShippingAmount: SfMoney;
  baseShippingInclTax: SfMoney;
  baseShippingTaxAmount: SfMoney;
  baseDiscountAmount: SfMoney;
  baseGrandTotal: SfMoney;
  baseTaxAmount: SfMoney;
  baseDiscountTaxCompensationAmount: SfMoney;
  baseShippingDiscountTaxCompensationAmount: SfMoney;
  discountTaxCompensationAmount: SfMoney;
  shippingDiscountTaxCompensationAmount: SfMoney;
  emailSent: boolean;
  canVoid: boolean;
  canRefund: boolean;
  createdAt: string;
  updatedAt: string;
  $custom?: SfInvoiceCustom;
}

export interface SfShipmentCustom extends InferCustom<"normalizeShipment"> {}

export interface SfShipment {
  id: SfShipmentId;
  incrementId?: string;
  orderId: SfOrderId;
  orderIncrementId?: string;
  shipmentNumber?: string;
  status: SfShipmentStatus;
  trackingNumber?: string;
  carrierCode: string;
  carrierTitle: string;
  shippingDescription?: string;
  shippingLabel?: string;
  totalQty: number;
  totalWeight: number;
  shippingAmount: SfMoney;
  baseShippingAmount: SfMoney;
  shippingDiscountAmount: SfMoney;
  shippingTaxAmount: SfMoney;
  baseShippingTaxAmount: SfMoney;
  taxAmount: SfMoney;
  baseTaxAmount: SfMoney;
  discountAmount: SfMoney;
  baseDiscountAmount: SfMoney;
  grandTotal: SfMoney;
  baseGrandTotal: SfMoney;
  emailSent: boolean;
  items: Array<{
    id: string;
    orderItemId: SfId;
    productId: SfId;
    sku: string;
    name: string;
    qty: number;
    weight: number;
    price: SfMoney;
    basePrice: SfMoney;
    taxAmount: SfMoney;
    baseTaxAmount: SfMoney;
    discountAmount: SfMoney;
    baseDiscountAmount: SfMoney;
    rowTotal: SfMoney;
    baseRowTotal: SfMoney;
    rowTotalInclTax: SfMoney;
    baseRowTotalInclTax: SfMoney;
    extensionAttributes?: {
      source?: string;
      sourceCode?: string;
    };
  }>;
  addresses: SfAddress[];
  comments: Array<{
    id: string;
    createdAt: string;
    isCustomerNotified: boolean;
    isVisibleOnFront: boolean;
    comment: string;
    extensionAttributes?: Record<string, unknown>;
  }>;
  extensionAttributes?: {
    tracks?: Array<{
      number: string;
      carrierCode: string;
      title: string;
      url?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
  $custom?: SfShipmentCustom;
}

export interface SfCreditMemoCustom extends InferCustom<"normalizeCreditMemo"> {}

export interface SfCreditMemo {
  id: SfCreditMemoId;
  incrementId?: string;
  orderId: SfOrderId;
  orderIncrementId?: string;
  creditMemoNumber?: string;
  state: SfCreditMemoState;
  adjustment: SfMoney;
  adjustmentNegative: SfMoney;
  adjustmentPositive: SfMoney;
  baseAdjustment: SfMoney;
  baseAdjustmentNegative: SfMoney;
  baseAdjustmentPositive: SfMoney;
  discountAmount: SfMoney;
  discountDescription?: string;
  grandTotal: SfMoney;
  shippingAmount: SfMoney;
  shippingTaxAmount: SfMoney;
  subtotal: SfMoney;
  taxAmount: SfMoney;
  totalQty: number;
  baseDiscountAmount: SfMoney;
  baseGrandTotal: SfMoney;
  baseShippingAmount: SfMoney;
  baseShippingTaxAmount: SfMoney;
  baseSubtotal: SfMoney;
  baseTaxAmount: SfMoney;
  baseDiscountTaxCompensationAmount: SfMoney;
  baseShippingDiscountTaxCompensationAmount: SfMoney;
  discountTaxCompensationAmount: SfMoney;
  shippingDiscountTaxCompensationAmount: SfMoney;
  emailSent: boolean;
  canVoid: boolean;
  createdAt: string;
  updatedAt: string;
  $custom?: SfCreditMemoCustom;
}
