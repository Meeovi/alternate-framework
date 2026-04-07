import { ref, Ref } from 'vue'

export function useI18n(): { t: (key: string, ...args: any[]) => string; locale: Ref<string>; locales: any[] } {
  try {
    const maybeUseNuxt = (globalThis as any).useNuxtApp
    if (typeof maybeUseNuxt === 'function') {
      const nuxt = maybeUseNuxt() as any
      if (nuxt?.$i18n) return nuxt.$i18n
    }
    const maybeUseI18n = (globalThis as any).useI18n
    if (typeof maybeUseI18n === 'function' && (maybeUseI18n as any)._binding) return (maybeUseI18n as any)()
  } catch (e) {
    // fallthrough to fallback
  }

  const locale = ref('en')
  function t(key: string, ..._args: any[]) {
    return key
  }
  return { t, locale, locales: [] }
}
