import type { LocaleCode, LocaleObject } from '../types'

export const toLocaleObject = (value: LocaleCode | LocaleObject): LocaleObject => {
  if (typeof value === 'string') {
    return {
      code: value,
      name: value,
      language: value,
      dir: 'ltr',
    }
  }

  return {
    code: value.code,
    name: value.name || value.code,
    language: value.language || value.code,
    dir: value.dir || 'ltr',
  }
}

export const normalizeLocaleCode = (value: string | null | undefined) =>
  String(value || '').trim().replace('_', '-').toLowerCase()

export const pickSupportedLocale = (
  input: string | null | undefined,
  supported: string[],
): string | null => {
  const normalized = normalizeLocaleCode(input)
  if (!normalized) return null

  const exact = supported.find((item) => normalizeLocaleCode(item) === normalized)
  if (exact) return exact

  const base = normalized.split('-')[0]
  if (!base) return null
  return supported.find((item) => normalizeLocaleCode(item).split('-')[0] === base) || null
}

export const parseAcceptLanguage = (headerValue: string | null | undefined): string[] => {
  const raw = String(headerValue || '').trim()
  if (!raw) return []

  return raw
    .split(',')
    .map((part) => {
      const [lang = '', q = 'q=1'] = part.trim().split(';')
      const quality = Number(q.replace('q=', ''))
      return { lang: lang.trim(), quality: Number.isFinite(quality) ? quality : 1 }
    })
    .filter((item) => item.lang)
    .sort((a, b) => b.quality - a.quality)
    .map((item) => item.lang)
}

export const parseCookieHeader = (cookieHeader: string | null | undefined): Record<string, string> => {
  const output: Record<string, string> = {}
  const raw = String(cookieHeader || '').trim()
  if (!raw) return output

  for (const pair of raw.split(';')) {
    const [k, ...rest] = pair.trim().split('=')
    if (!k) continue
    output[decodeURIComponent(k)] = decodeURIComponent(rest.join('=') || '')
  }

  return output
}
