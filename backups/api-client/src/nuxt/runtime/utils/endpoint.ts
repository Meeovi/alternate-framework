export function toSameOriginPath(value: string | undefined, fallback: string): string {
  if (!value) {
    return fallback
  }

  if (value.startsWith('/')) {
    return value
  }

  return fallback
}