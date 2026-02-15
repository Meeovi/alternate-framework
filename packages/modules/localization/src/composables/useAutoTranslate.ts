import { useI18n as _useI18n } from 'vue-i18n'
import { computed } from 'vue'
import { currentLocales } from '../config/i18n'

function flatten(obj: Record<string, any>, prefix = '', out: Record<string, string> = {}) {
  for (const k of Object.keys(obj)) {
    const v = obj[k]
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v))
      flatten(v as Record<string, any>, key, out)
    else if (typeof v === 'string')
      out[key] = v
  }
  return out
}

function toLocaleString(loc: any) {
  if (!loc)
    return ''
  if (typeof loc === 'string')
    return loc
  return (loc && (loc.value ?? String(loc))) || ''
}

export function useAutoTranslate() {
  const i18n = _useI18n()

  const sourceLocaleCode = computed(() => {
    const found = currentLocales.find(l => l.code === 'en-US' || l.code === 'en')
    return (found && found.code) || (currentLocales[0] && currentLocales[0].code) || 'en'
  })

  function getMessages(locale: string | any) {
    const localeStr = toLocaleString(locale)
    try {
      const maybe = (i18n as any).getLocaleMessage ? (i18n as any).getLocaleMessage(localeStr) : (i18n as any).global && (i18n as any).global.getLocaleMessage && (i18n as any).global.getLocaleMessage(localeStr)
      return (maybe || {}) as Record<string, any>
    }
    catch {
      return {}
    }
  }

  async function translate(text: string, toLocale?: string): Promise<string> {
    const target = toLocale || (i18n as any).locale || sourceLocaleCode.value

    // If text is a translation key, use i18n.t directly
    try {
      const te = (i18n as any).te || (i18n as any).global && (i18n as any).global.te
      const tt = (i18n as any).t || (i18n as any).global && (i18n as any).global.t
      if (te && te.call && te.call(i18n, text)) {
        return String(tt.call(i18n, text, undefined, toLocaleString(target)))
      }
    }
    catch { /* ignore */ }

    // Attempt to find the key by matching value in source locale messages
    const sourceMessages = flatten(getMessages(sourceLocaleCode.value))
    const targetMessages = flatten(getMessages(target))

    const foundKey = Object.keys(sourceMessages).find(k => sourceMessages[k] === text)
    if (foundKey && targetMessages[foundKey])
      return targetMessages[foundKey]

    // No local translation found — return original text (server-side provider can be used later)
    return text
  }

  return {
    translate,
    translateComputed: (textRef: string | (() => string), toLocale?: string) => computed(() => {
      const text = typeof textRef === 'function' ? (textRef as () => string)() : textRef
      // synchronous best-effort: try to resolve locally, not calling provider
      const target = toLocale || (i18n as any).locale || sourceLocaleCode.value
      const sourceMessages = flatten(getMessages(sourceLocaleCode.value))
      const targetMessages = flatten(getMessages(target))
      const foundKey = Object.keys(sourceMessages).find(k => sourceMessages[k] === text)
      if (foundKey && targetMessages[foundKey])
        return targetMessages[foundKey]
      return text
    }),
  }
}

export default useAutoTranslate
