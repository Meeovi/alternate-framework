type PlainObject = Record<string, unknown>

function isObject(value: unknown): value is PlainObject {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export function deepMerge<T extends PlainObject, U extends PlainObject>(
  target: T,
  source: U
): T & U {
  const output: PlainObject = { ...target }

  for (const [key, value] of Object.entries(source)) {
    const existing = output[key]

    if (Array.isArray(existing) && Array.isArray(value)) {
      output[key] = [...existing, ...value]
      continue
    }

    if (isObject(existing) && isObject(value)) {
      output[key] = deepMerge(existing, value)
      continue
    }

    output[key] = value
  }

  return output as T & U
}
