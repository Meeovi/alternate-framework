import type { SfProduct } from "./product";
import type { SfCustomerGroup } from "./customers";

export interface SfQuote {
  id: string;
  customerId: string;
  addressInformation?: Record<string, any>;
  items: Array<{
    id: string;
    sku: string;
    name: string;
    qty: number;
    price: number;
    basePrice: number;
    rowTotal: number;
    baseRowTotal: number;
    qtyOrdered: number;
    productOption?: {
      id: string;
      title: string;
      type: string;
      values: Array<{
        id: string;
        title: string;
        price: number;
        priceType: string;
      }>;
    };
    extensionAttributes?: Record<string, unknown>;
  }>;
  shippingAddress: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    regionCode: string;
    region: string;
    postcode: string;
    countryId: string;
    telephone: string;
    email: string;
  };
  billingAddress: {
    firstname: string;
    lastname: string;
    street: string[];
    city: string;
    regionCode: string;
    region: string;
    postcode: string;
    countryId: string;
    telephone: string;
    email: string;
  };
  paymentMethod: {
    method: string;
    additionalData: Record<string, any>;
  };
  shippingMethod: {
    methodCode: string;
    carrierCode: string;
    carrierTitle: string;
    methodTitle: string;
    amount: number;
    amountExclTax: number;
    taxAmount: number;
  };
  totals: {
    subtotal: number;
    baseSubtotal: number;
    discountAmount: number;
    baseDiscountAmount: number;
    subtotalWithDiscount: number;
    baseSubtotalWithDiscount: number;
    taxAmount: number;
    baseTaxAmount: number;
    shippingAmount: number;
    baseShippingAmount: number;
    shippingTaxAmount: number;
    baseShippingTaxAmount: number;
    shippingDiscountAmount: number;
    baseShippingDiscountAmount: number;
    grandTotal: number;
    baseGrandTotal: number;
    weeeTaxApplied: number;
    weeeTaxDisposition: number;
    discountDescription: string;
    itemsQty: number;
    items: Array<{
      name: string;
      rowTotal: number;
      baseRowTotal: number;
      qty: number;
      taxAmount: number;
    }>;
    selectedShippingMethod: string;
  };
  currency: string;
  isVirtual: boolean;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
