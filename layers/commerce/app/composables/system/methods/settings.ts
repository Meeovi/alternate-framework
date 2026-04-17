import type { Simplify } from '../defs/typeHelpers';
import type { SfCurrency } from "../models";

export interface GetCurrenciesExtendedArgs {}
export interface GetCurrenciesCustomArgs {}

export type GetCurrenciesArgs = {
  //$extended?: GetCurrenciesExtendedArgs;
  //$custom?: GetCurrenciesCustomArgs;
};

export type GetCurrencies = (args?: Simplify<GetCurrenciesArgs>) => Promise<{
  currencies: SfCurrency[];
  defaultCurrency: SfCurrency;
  currentCurrency: SfCurrency;
}>;
