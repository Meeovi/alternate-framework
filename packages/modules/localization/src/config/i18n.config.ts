import {
  currentLocales,
  datetimeFormats,
  numberFormats,
  pluralRules,
} from './i18n'
import { defineI18nConfig } from "@nuxtjs/i18n/dist/runtime/composables/defineI18nConfig"

export default defineI18nConfig(() => {
  return {
    legacy: false,
    availableLocales: currentLocales.map(l => l.code),
    fallbackLocale: 'en-US',
    fallbackWarn: true,
    missingWarn: true,
    datetimeFormats,
    numberFormats,
    pluralRules,
  }
})
