/* eslint-disable @typescript-eslint/no-explicit-any */
type ApiMethods = Record<string, (...args: any[]) => any>;

interface ApiClientExtension {
  name: string;
  extendApiMethods?: Record<string, (...args: any[]) => any>;
  hooks?: (req: any, res: any) => any;
  isNamespaced?: boolean;
}
import { mergeDeepRight } from "ramda";
import { toContextualizedNormalizers } from "../helpers";
const Logger: any = console;
import type {
  BaseNormalizerContext,
  CreateUnifiedExtensionParams,
  DefineAddCustomFields,
  GetAdditionalNormalizerContextConstraint,
  GetAdditionalNormalizerContextParams,
  NormalizersConstraint,
  UnifiedCmsConfig,
  UnifiedConfig,
  UnifiedExtensionContextConstraint,
  UnifiedExtensionFactoryParams,
} from "./types";

const CURRENCY_COOKIE = "vsf-currency";
const LOCALE_COOKIE = "vsf-locale";

/**
 * @description A factory function which builds the default normalizers and default API methods into unified extension.
 * It expects the type of the API methods, normalizers, and config as generics.
 *
 * @returns A `createUnifiedExtension` function which can be used by the user to create a unified extension.
 *
 * @example
 * ```ts
 * export const createUnifiedExtension = unifiedExtensionFactory<
 *   typeof apiMethods,
 *   Normalizers,
 *   Config
 * >({
 *   extendApiMethods: apiMethods,
 *   normalizers,
 * });
 * ```
 */
export function unifiedExtensionFactory<
  TApiMethods extends ApiMethods,
  TNormalizers extends NormalizersConstraint,
  TConfig extends UnifiedConfig,
>(factoryParams: UnifiedExtensionFactoryParams<TApiMethods, TNormalizers>) {
  return function createUnifiedExtension<
    TAddCustomFieldsArray extends [
      DefineAddCustomFields<TNormalizers>,
      ...DefineAddCustomFields<TNormalizers>[],
    ],
  >(
    params: CreateUnifiedExtensionParams<TConfig, TApiMethods, TNormalizers, TAddCustomFieldsArray>,
  ) {
    const {
      extendApiMethods: defaultApiMethods,
      normalizers: defaultNormalizers,
      getAdditionalNormalizerContext,
    } = factoryParams;
    const baseNormalizers = { ...defaultNormalizers, ...params.normalizers.override };
    const normalizers = mergeNormalizers(baseNormalizers, params.normalizers.addCustomFields);
    const { config: extensionConfig, methods, isNamespaced = factoryParams.isNamespaced } = params;

    return {
      name: "unified",
      extendApiMethods: {
        ...defaultApiMethods,
        ...methods?.override,
      } as TApiMethods,
      hooks(req: any, res: any) {
        return {
          beforeCall({ args, configuration }: { args: any; configuration: any }) {
            if (!req.cookies[CURRENCY_COOKIE] && extensionConfig) {
              req.cookies[CURRENCY_COOKIE] = extensionConfig.defaultCurrency;
            }
            configuration.unified = extensionConfig;
            if (!configuration.normalizerContext) {
              configuration.normalizerContext = createNormalizerContext(
                normalizers,
                getAdditionalNormalizerContext,
                { req, res, config: configuration },
              );
              configuration.normalizerContext.currency =
                req.cookies?.[CURRENCY_COOKIE] ?? extensionConfig.defaultCurrency ?? "USD";
            }

            return args;
          },
        };
      },
      isNamespaced,
      normalizers,
      /**
       * @internal You shouldn't use this field. It's present only to infer the type of addCustomFields
       */
      _addCustomFields: {} as TAddCustomFieldsArray,
    } satisfies ApiClientExtension & Record<string, any>;
  };
}

/**
 * @description A factory function which builds the default normalizers and default API methods into unified extension.
 * It expects the type of the API methods, normalizers, and config as generics.
 *
 * @returns A Middleware extension which can be registered in the API client.
 *
 * @example
 * ```ts
 * export const createUnifiedExtension = createUnifiedCmsExtension({
 *   extendApiMethods: {
 *     getPage,
 *   },
 *   normalizers,
 *   getAdditionalNormalizerContext: () => ({
 *     documentToHtmlString,
 *   }),
 * });
 * ```
 */
export function createUnifiedCmsExtension<
  TApiMethods extends ApiMethods,
  TNormalizers extends NormalizersConstraint,
>(params: UnifiedExtensionFactoryParams<TApiMethods, TNormalizers>) {
  const {
    extendApiMethods,
    normalizers: defaultNormalizers,
    getAdditionalNormalizerContext,
    isNamespaced = true,
  } = params;

  return {
    name: "unified",
    extendApiMethods,
    isNamespaced,
    hooks(req: any, res: any) {
      return {
        beforeCall({ args, configuration }: { args: any; configuration: any }) {
          if (!configuration.normalizerContext) {
            const unifiedConfig = configuration?.unified ?? ({} as UnifiedCmsConfig<TNormalizers>);
            const baseNormalizers = {
              ...defaultNormalizers,
              ...unifiedConfig.normalizers?.override,
            };
            const normalizers = mergeNormalizers(
              baseNormalizers,
              unifiedConfig.normalizers?.addCustomFields ?? [],
            );

            configuration.normalizerContext = createNormalizerContext(
              normalizers,
              getAdditionalNormalizerContext,
              { req, res, config: configuration },
            );
          }
          return args;
        },
      };
    },
  } satisfies ApiClientExtension;
}

/**
 * A helper function to get the normalizers from the context.
 * @param context Context passed to the API method
 * @returns normalizers
 *
 * @example
 * ```ts
 * const { normalizeProduct } = getNormalizers(context);
 * ```
 */
export function getNormalizers<TContext extends UnifiedExtensionContextConstraint>(
  context: TContext,
): TContext["config"]["normalizerContext"]["normalizers"] {
  return context.config.normalizerContext.normalizers;
}

/**
 * A helper function to assign values to the normalizer context.
 * @param context Context passed to the API method
 * @param overrides Object with the values to override in the normalizer context
 * @returns void - it mutates the context
 *
 * @example
 * ```ts
 * assignToNormalizerContext(context, { locale: "de" });
 * ```
 */
export function assignToNormalizerContext<TContext extends UnifiedExtensionContextConstraint>(
  context: TContext,
  overrides: Partial<TContext["config"]["normalizerContext"]>,
) {
  Object.assign(context.config.normalizerContext, overrides);
}

function createNormalizerContext<TNormalizers extends NormalizersConstraint>(
  normalizers: TNormalizers,
  getAdditionalNormalizerContext: GetAdditionalNormalizerContextConstraint,
  { req, res, config }: GetAdditionalNormalizerContextParams,
) {
  const logger = Logger;
  const normalizerContext: BaseNormalizerContext<TNormalizers> = {
    locale: req.cookies?.[LOCALE_COOKIE] ?? "en",
    ...getAdditionalNormalizerContext({ req, res, config }),
    logger,
  };
  normalizerContext.normalizers = toContextualizedNormalizers(normalizers, () => normalizerContext);

  return normalizerContext;
}

export function mergeNormalizers<TNormalizers extends NormalizersConstraint>(
  baseNormalizers: TNormalizers,
  addCustomFields: DefineAddCustomFields<TNormalizers>[],
): TNormalizers {
  const normalizers: any = { ...baseNormalizers };

  addCustomFields.forEach((customFieldsNormalizers) => {
    Object.entries(customFieldsNormalizers).forEach(([name, customFields]) => {
      const currentNormalizer = normalizers[name]!;
      if (normalizers[name] && customFields) {
        normalizers[name] = (input: any, context: any) =>
          mergeDeepRight(currentNormalizer(input, context), {
            $custom: customFields(input, context),
          });
      }
    });
  });

  return normalizers;
}
