export function dynamicNormalize(raw: any): Record<string, any> {
  if (Array.isArray(raw)) {
    return raw.map(dynamicNormalize)
  }

  if (typeof raw !== 'object' || raw === null) {
    return raw
  }

  const normalized: Record<string, any> = {}

  for (const key of Object.keys(raw)) {
    const value = raw[key]

    normalized[key] = Array.isArray(value)
      ? value.map(dynamicNormalize)
      : typeof value === 'object'
        ? dynamicNormalize(value)
        : value
  }

  return normalized
}
