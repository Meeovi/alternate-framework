import { defaultAlternateLocateLocales, defaultAlternateLocateLocale } from './i18n'

export default defineNuxtConfig({
    modules: ['@nuxtjs/i18n'],

    i18n: {
        strategy: 'no_prefix',
        defaultLocale: defaultAlternateLocateLocale,
        locales: defaultAlternateLocateLocales,
        experimental: {
            localeDetector: './localeDetector.ts'
        }
    }
})