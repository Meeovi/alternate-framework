import type { SfProduct } from "./product";

export interface SfRequisitionList {
  id: string;
  customerId: string;
  name: string;
  description: string;
  updatedAt: string;
  createdAt: string;
  items: Array<{
    id: string;
    productId: string;
    productSku: string;
    productName: string;
    qty: number;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  }>;
  isShared: boolean;
  sharedAt?: string;
  extensionAttributes?: Record<string, unknown>;
}
