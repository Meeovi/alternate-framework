// Shared composable to provide i18n config from alternate-locate
import {
  defaultAlternateLocateLocales,
  defaultAlternateLocateLocale,
  createDefaultAlternateLocateVueI18nConfig
} from 'alternate-gateway/adapters/nuxt/i18n'

export function useI18nConfig() {
  return {
    locales: defaultAlternateLocateLocales,
    defaultLocale: defaultAlternateLocateLocale,
    ...createDefaultAlternateLocateVueI18nConfig(),
  }
}
