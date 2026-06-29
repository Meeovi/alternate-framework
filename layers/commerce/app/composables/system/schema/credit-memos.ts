export interface SfCreditMemo {
  id: string;
  incrementId: string;
  orderId: string;
  orderIncrementId: string;
  state: string;
  adjustment: number;
  adjustmentNegative: number;
  adjustmentPositive: number;
  baseAdjustment: number;
  baseAdjustmentNegative: number;
  baseAdjustmentPositive: number;
  baseCurrencyCode: string;
  discountAmount: number;
  baseDiscountAmount: number;
  discountDescription: string;
  emailSent: boolean;
  entityId: number;
  globalCurrencyCode: string;
  grandTotal: number;
  baseGrandTotal: number;
  shippingAmount: number;
  baseShippingAmount: number;
  taxAmount: number;
  baseTaxAmount: number;
  subtotal: number;
  baseSubtotal: number;
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields omitted
}
