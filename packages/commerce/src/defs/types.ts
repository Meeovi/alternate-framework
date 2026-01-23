/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-use-before-define */
type ApiMethods = Record<string, (...args: any[]) => any>;
import type { MergeDeep } from "type-fest";
import type { ContextualizedNormalizers } from "../helpers";
import type { Maybe, SfCurrency, SfFacetType } from "../models";

// Minimal local IntegrationContext replacement
export interface IntegrationContext<CLIENT = any, CONFIG = any, API = any> {
  client: CLIENT;
  config: CONFIG;
  api: API;
  req?: any;
  res?: any;
  [x: string]: any;
}

export interface VSFLogger {
  debug(message?: any, ...args: any[]): void;
  info(message?: any, ...args: any[]): void;
  warn(message?: any, ...args: any[]): void;
  error(message?: any, ...args: any[]): void;
}
export interface UnifiedConfig {
  currencies?: SfCurrency[];
  defaultCurrency: SfCurrency;
}

export interface BaseNormalizerContext<TNormalizers extends NormalizersConstraint = any> {
  locale: string;
  currency: string;
  normalizers: ContextualizedNormalizers<TNormalizers>;
  logger: VSFLogger;
}

export type NormalizerConstraint<
  TNormalizerContext extends BaseNormalizerContext = BaseNormalizerContext,
> = (rawData: any, context: TNormalizerContext) => any;

export type NormalizersConstraint<TNormalizerContext extends BaseNormalizerContext = any> = Record<
  string,
  NormalizerConstraint<TNormalizerContext>
>;

export type UnifiedExtensionContextConstraint<
  TNormalizerContext extends BaseNormalizerContext = any,
> = IntegrationContext & { config: { normalizerContext: TNormalizerContext } };

export type GetFacetTypeFn<TInput> = (input: TInput) => Maybe<SfFacetType | string>;
export type FilterFacetsFn<TInput> = (input: TInput) => boolean;

export type GetAdditionalNormalizerContextParams<TConfig extends Record<string, any> = any> = {
  req: IntegrationContext["req"];
  res: IntegrationContext["res"];
  config: TConfig;
};

export type GetAdditionalNormalizerContextConstraint = (
  params: GetAdditionalNormalizerContextParams,
) => any;

export type GetAdditionalNormalizerContext<
  TIntegrationContext extends IntegrationContext,
  TNormalizerContext extends BaseNormalizerContext,
> = (
  params: GetAdditionalNormalizerContextParams<TIntegrationContext["config"]>,
) => Omit<TNormalizerContext, keyof BaseNormalizerContext>;

export interface AddCustomFields {}

export type InferAddCustomFieldsFromArray<
  TArray extends Record<string, (...args: any) => any>[],
  TResult = {},
> = TArray extends [
  infer THead extends Record<string, (...args: any) => any>,
  ...infer TTail extends Record<string, (...args: any) => any>[],
]
  ? InferAddCustomFieldsFromArray<
      TTail,
      MergeDeep<
        TResult,
        {
          [TKey in keyof THead]: Exclude<ReturnType<THead[TKey]>, null | undefined>;
        }
      >
    >
  : TResult;

export type InferAddCustomFields<TUnifiedExtension extends { _addCustomFields: any }> =
  InferAddCustomFieldsFromArray<TUnifiedExtension["_addCustomFields"]>;

export type InferCustom<TNormalizer extends string> =
  AddCustomFields extends Record<TNormalizer, infer TCustom> ? TCustom : object;

export type DefineAddCustomFields<TNormalizers extends NormalizersConstraint> = {
  [Key in keyof TNormalizers]?: (...args: Parameters<TNormalizers[Key]>) => any;
};

export interface NormalizersConfig<
  TNormalizers extends NormalizersConstraint,
  TAddCustomFieldsArray,
> {
  override?: Partial<TNormalizers>;
  addCustomFields: TAddCustomFieldsArray;
}

export interface UnifiedExtensionFactoryParams<
  TApiMethods extends ApiMethods,
  TNormalizers extends NormalizersConstraint,
> {
  normalizers: TNormalizers;
  extendApiMethods: TApiMethods;
  getAdditionalNormalizerContext: GetAdditionalNormalizerContextConstraint;
  isNamespaced?: boolean;
}

export interface CreateUnifiedExtensionParams<
  TConfig extends Record<string, any>,
  TApiMethods extends ApiMethods,
  TNormalizers extends NormalizersConstraint,
  TAddCustomFieldsArray extends DefineAddCustomFields<TNormalizers>[],
> {
  config: TConfig;
  normalizers: NormalizersConfig<TNormalizers, TAddCustomFieldsArray>;
  methods?: {
    override?: Partial<TApiMethods>;
  };
  isNamespaced?: boolean;
}

export interface UnifiedCmsConfig<
  TNormalizers extends NormalizersConstraint,
  TAddCustomFieldsArray = DefineAddCustomFields<TNormalizers>[],
> {
  normalizers?: NormalizersConfig<TNormalizers, TAddCustomFieldsArray>;
}
