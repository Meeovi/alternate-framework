export interface SfPayment {
  id: string;
  method?: string;
  amount: number;
  baseAmount: number;
  baseShippingAmount: number;
  shippingAmount: number;
  currencyCode: string;
  additionalInformation: Record<string, any>;
  billingName?: string;
  billingAddress?: Record<string, any>;
  extensionAttributes?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
