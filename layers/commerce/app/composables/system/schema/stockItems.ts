import type { SfProduct } from "./product";

export interface SfStockItem {
  itemId: string;
  productId: string;
  sku: string;
  qty: number;
  minQty: number;
  useConfigMinQty: boolean;
  isQtyDecimal: boolean;
  backorders: number;
  minSaleQty: number;
  maxSaleQty: number;
  isInStock: boolean;
  notifyStockQty: number;
  useConfigNotifyStockQty: boolean;
  useConfigBackorders: boolean;
  useConfigMinSaleQty: boolean;
  useConfigMaxSaleQty: boolean;
  enableQtyIncrements: boolean;
  qtyIncrements: number;
  useConfigEnableQtyIncrements: boolean;
  websiteId?: string;
  stockId?: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfStock {
  stockId: string;
  name: string;
  websiteId: string;
  websiteName?: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfInventorySource {
  sourceCode: string;
  name: string;
  enabled: boolean;
  type: "default" | "shipping" | "pickup_location" | "warehouse";
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  latitude?: number;
  longitude?: number;
  countryId?: string;
  regionId?: string;
  region?: string;
  city?: string;
  street?: string;
  postcode?: string;
  description?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfInventorySourceItem {
  sourceItemId: string;
  sourceCode: string;
  sku: string;
  status: 1 | 2 | 3;
  qty: number;
  extendedQty: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface SfReservation {
  entityId: string;
  metadata: Record<string, any>;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfInventoryReservation {
  id: string;
  stockId?: string;
  sourceCode?: string;
  productId: string;
  sku: string;
  qty: number;
  status: "open" | "committed" | "released" | "cancelled";
  metadata?: Record<string, any>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}
