export interface SfShipment {
  id: string;
  incrementId: string;
  orderId: string;
  orderIncrementId: string;
  shipmentNumber?: string;
  trackingNumber?: string;
  carrierCode: string;
  carrierTitle: string;
  shippingDescription?: string;
  shippingLabel?: string;
  totalQty: number;
  totalWeight: number;
  shippingAmount: number;
  shippingDiscountAmount: number;
  shippingTaxAmount: number;
  taxAmount: number;
  discountAmount: number;
  grandTotal: number;
  baseShippingAmount: number;
  baseShippingDiscountAmount: number;
  baseShippingTaxAmount: number;
  baseTaxAmount: number;
  baseDiscountAmount: number;
  baseGrandTotal: number;
  emailSent: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional relations omitted
}
