import type { NormalizersConstraint } from "../defs";

export type ContextualizedNormalizers<TNormalizers extends NormalizersConstraint> = {
  [TKey in keyof TNormalizers]: (
    input: Parameters<TNormalizers[TKey]>[1],
  ) => ReturnType<TNormalizers[TKey]>;
};

export function toContextualizedNormalizers<
  TNormalizers extends NormalizersConstraint,
  TNormalizerContext extends Record<string, any>,
>(
  normalizers: TNormalizers,
  getContext: () => TNormalizerContext,
): ContextualizedNormalizers<TNormalizers> {
  return Object.keys(normalizers).reduce((acc: any, key) => {
    acc[key] = (input: any) => normalizers[key]!(getContext(), input);
    return { ...acc };
  }, {});
}
