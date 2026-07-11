import type { Simplify } from '../defs/typeHelpers';
import type { SfCurrency } from "../models";

export interface GetCurrenciesExtendedArgs {}
export interface GetCurrenciesCustomArgs {}

export type GetCurrenciesArgs = {
  //$extended?: GetCurrenciesExtendedArgs;
  //$custom?: GetCurrenciesCustomArgs;
};

export interface GetExchangeRatesExtendedArgs {}
export interface GetExchangeRatesCustomArgs {}

export type GetExchangeRatesArgs = {
  baseCurrency?: string;
  targetCurrencies?: string[];
  //$extended?: GetExchangeRatesExtendedArgs;
  //$custom?: GetExchangeRatesCustomArgs;
};

export type GetExchangeRates = (args?: Simplify<GetExchangeRatesArgs>) => Promise<Record<string, number>>;

export type GetCurrencies = (args?: Simplify<GetCurrenciesArgs>) => Promise<{
  currencies: SfCurrency[];
  defaultCurrency: SfCurrency;
  currentCurrency: SfCurrency;
}>;
