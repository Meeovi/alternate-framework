function isExternalOrSpecial(value: string) {
  return /^(?:[a-z]+:)?\/\//i.test(value) || value.startsWith('#') || value.startsWith('?')
}

export function normalizeRoutePath(input?: unknown): string {
  const value = String(input || '').trim()
  if (!value) return '/'
  if (isExternalOrSpecial(value)) return value

  const queryIndex = value.indexOf('?')
  const hashIndex = value.indexOf('#')
  const cut = [queryIndex, hashIndex].filter((index) => index >= 0).sort((a, b) => a - b)[0] ?? -1

  const pathname = cut >= 0 ? value.slice(0, cut) : value
  const suffix = cut >= 0 ? value.slice(cut) : ''

  const normalizedPath = `/${pathname.replace(/^\/+/, '')}`.replace(/\/{2,}/g, '/')
  return `${normalizedPath}${suffix}`
}

export function joinRoutePath(base: unknown, slug?: unknown): string {
  const segment = String(slug || '').trim()

  if (!segment) {
    return normalizeRoutePath(base)
  }

  if (isExternalOrSpecial(segment)) {
    return segment
  }

  if (segment.startsWith('/')) {
    return normalizeRoutePath(segment)
  }

  const basePath = normalizeRoutePath(base || '/')
  const left = basePath === '/' ? '' : basePath.replace(/\/+$/, '')
  return normalizeRoutePath(`${left}/${segment}`)
}

export function useRoutePath() {
  return {
    normalizeRoutePath,
    joinRoutePath,
  }
}

export default useRoutePath