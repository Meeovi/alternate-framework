export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(target: T, source: U): T & U {
  const output: Record<string, any> = { ...target }

  for (const [key, value] of Object.entries(source)) {
    if (Array.isArray(value)) {
      output[key] = [...value]
      continue
    }

    if (value && typeof value === 'object') {
      const base = output[key] && typeof output[key] === 'object' && !Array.isArray(output[key])
        ? output[key]
        : {}
      output[key] = deepMerge(base, value as Record<string, any>)
      continue
    }

    output[key] = value
  }

  return output as T & U
}
