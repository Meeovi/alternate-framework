export interface SfTaxRate {
  id: string;
  taxCountryId: string;
  taxRegionId: string;
  rate: number;
  taxPostcode: string;
  taxCalculationRateId: string;
  createdAt: string;
  updatedAt: string;
  extensionAttributes?: Record<string, unknown>;
}
