import type { SfProduct } from "./product";

export interface SfBundleProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: SfProductStatus;
  visibility: SfProductVisibility;
  typeId: "bundle";
  createdAt: string;
  updatedAt: string;
  items: SfProduct[];
  extensionAttributes?: Record<string, unknown>;
}
