import { isObject } from './isObject'

export function deepMerge<T extends object, U extends object>(
  target: T,
  source: U
): T & U {
  const output: any = { ...target }

  for (const key of Object.keys(source)) {
    const sourceValue = (source as any)[key]
    const targetValue = (target as any)[key]

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key] = deepMerge(targetValue, sourceValue)
    } else {
      output[key] = sourceValue
    }
  }

  return output
}