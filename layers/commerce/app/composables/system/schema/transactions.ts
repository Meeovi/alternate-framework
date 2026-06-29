export interface SfTransaction {
  id: string;
  parentId?: string;
  paymentId: string;
  orderId?: string;
  status: string;
  type: "authorization" | "capture" | "void" | "refund" | "order" | "capture_offline";
  isClosed: boolean;
  closedAmount: number;
  amount: number;
  baseAmount: number;
  currencyCode: string;
  additionalInformation: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
