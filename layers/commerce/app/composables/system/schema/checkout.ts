export interface SfCheckout {
  id: string;
  quoteId: string;
  customerId?: string;
  email: string;
  shippingAddress?: Record<string, any>;
  billingAddress?: Record<string, any>;
  paymentMethod?: Record<string, any>;
  shippingMethodCode?: string;
  shippingCarrierCode?: string;
  coupons?: string[];
  totals: {
    subtotal: number;
    taxAmount: number;
    shippingAmount: number;
    discountAmount: number;
    grandTotal: number;
    baseSubtotal: number;
    baseTaxAmount: number;
    baseShippingAmount: number;
    baseDiscountAmount: number;
    baseGrandTotal: number;
  };
  items: Array<{
    id: string;
    sku: string;
    name: string;
    qty: number;
    price: number;
    basePrice: number;
    rowTotal: number;
    baseRowTotal: number;
    discountAmount: number;
  }>;
  isVirtual: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields omitted
}
