import type { SfProduct } from "./product";

export interface SfConfigurableProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  status: SfProductStatus;
  visibility: SfProductVisibility;
  typeId: "configurable";
  createdAt: string;
  updatedAt: string;
  options: SfProductConfigurableOption[];
  variants: SfProduct[];
  extensionAttributes?: Record<string, unknown>;
}
