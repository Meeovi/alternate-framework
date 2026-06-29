export interface SfInventoryLot {
  id: string;
  sourceCode: string;
  sku: string;
  qty: number;
  batch?: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
