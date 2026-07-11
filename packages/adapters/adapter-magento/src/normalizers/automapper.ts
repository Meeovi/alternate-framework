// packages/adapters/adapter-magento/src/normalizers/automapper.ts

/**
 * NormalizerMap automatically filters out null or undefined states from the source object,
 * ensuring that your structural mapping properties can access properties safely.
 */
export type NormalizerMap<Source, Target = any> = {
  [key: string]: (source: NonNullable<Source>) => Target[keyof Target] | any;
};

export function createNormalizer<Source, Target>(
  map: NormalizerMap<Source, Target>
) {
  return (source: Source): Partial<Target> => {
    const result: any = {};
    
    // 1. Instantly return an empty object if the incoming payload is null or undefined
    if (!source) return result;
    
    // 2. Loop through rules safely knowing 'source' is completely valid
    for (const key in map) {
      if (typeof map[key] === 'function') {
        result[key] = map[key](source as NonNullable<Source>);
      }
    }
    return result;
  };
}