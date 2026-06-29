export interface SfRule {
  id: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
  customerGroupIds: string[];
  websiteIds: string[];
  simpleAction: string;
  discountAmount: number;
  discountQty?: number;
  applyToShipping: boolean;
  simpleFreeShipping: number;
  stopRulesProcessing: boolean;
  priority: number;
  fromDate?: string;
  toDate?: string;
  usesPerCoupon: number;
  usesPerCustomer: number;
  couponType: string;
  couponCode?: string;
  timeFormat: number;
  isAdvanced: boolean;
  pager: number;
  conditions?: string;
  actions?: string;
  extensionAttributes?: Record<string, unknown>;
}
