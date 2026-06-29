export interface SfSubscription {
  id: string;
  customerId: string;
  productId: string;
  productSku: string;
  productName: string;
  status: "active" | "suspended" | "canceled" | "expired";
  scheduleInterval: string;
  scheduleFrequency: number;
  scheduleStartDate: string;
  scheduleEndDate?: string;
  nextBillingDate?: string;
  createdAt: string;
  updatedAt: string;
  // Additional fields omitted
}
