export interface SfPrice {
  regular: number;
  final: number;
  special?: number;
  currency: string;
  discountPercent: number;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfCatalogPriceRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  customerGroupIds: string[];
  websiteIds: string[];
  productIds: string[];
  categoryIds: string[];
  fromDate: string;
  toDate: string;
  actionOperator: string;
  actionAmount: number;
  stopRulesProcessing: boolean;
  extensionAttributes?: Record<string, unknown>;
}

export interface SfCartPriceRule {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  customerGroupIds: string[];
  websiteIds: string[];
  couponType: string;
  couponCode?: string;
  usagePerCoupon: number;
  usagePerCustomer: number;
  usesPerCustomer: number;
  timesUsed: number;
  fromDate: string;
  toDate: string;
  priority: number;
  conditions: string;
  actions: string;
  stopRulesProcessing: boolean;
  extensionAttributes?: Record<string, unknown>;
}
