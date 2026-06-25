import type { Ref } from 'vue';

export interface WeeeTaxDetails {
  category: 'LDA' | 'Cooling' | 'Display' | 'Lamps' | 'SMW' | 'PV' | 'Vapes'; // Mandatory regulatory streams
  unitWeightKg: number;
  fixedEcoContribution: number; // DEEE is often a fixed amount per unit/weight, not a %
}

export interface TaxItem {
  id: string | number;
  type: 'VAT' | 'WEEE' | 'DEEE'; // Differentiate tax logic
  rate?: number; // For VAT (e.g., 20)
  weeeDetails?: WeeeTaxDetails;  // For WEEE/DEEE
}

export interface UseTax {
  data: Ref<TaxItem[] | null>;
  loading: Ref<boolean>;
  error: Ref<Error | null>;
  fetchTax: () => Promise<void>;
  fixProductTax: (product: any) => any;
  fixProductsTax: (products: any[]) => any[];
}

export type UseTaxReturn = UseTax;