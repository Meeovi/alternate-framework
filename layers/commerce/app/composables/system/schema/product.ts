import type { SfProductType } from "./product-types";
import type { SfAttribute } from "./attributes";

export interface SfProduct {
  id: string;
  sku: string;
  name: string;
  status: SfProductStatus;
  visibility: SfProductVisibility;
  typeId: SfProductType;
  price: number;
  attributeSetId: string;
  weight?: number;
  createdAt: string;
  updatedAt: string;
  createdAtSql?: string;
  updatedAtSql?: string;
  // Additional fields omitted
}

export type SfProductStatus = 'enabled' | 'disabled';
export type SfProductVisibility = 'not_visible_individually' | 'catalog' | 'search' | 'catalog_search';
