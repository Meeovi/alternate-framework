export interface SfReturn {
  id: string;
  orderId: string;
  incrementId: string;
  status: string;
  state: string;
  customerId: string;
  items: Array<{
    id: string;
    orderItemId: string;
    productId: string;
    sku: string;
    name: string;
    qty: number;
    reason: string;
    condition: "received" | "damaged" | "rejected";
    resolution: string;
  }>;
  createdAt: string;
  updatedAt: string;
  createdAtSql?: string;
  updatedAtSql?: string;
  // Additional fields omitted
}
