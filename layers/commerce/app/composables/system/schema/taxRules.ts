export interface SfTaxRule {
  id: string;
  code: string;
  priority: number;
  position: number;
  customerTaxClassIds: string[];
  productTaxClassIds: string[];
  taxRateIds: string[];
  calculateSubtotal: boolean;
  extensionAttributes?: Record<string, unknown>;
}
