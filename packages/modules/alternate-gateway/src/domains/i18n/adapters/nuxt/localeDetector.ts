import { createNuxtI18nLocaleDetector } from './plugin'
import { defaultAlternateLocateDetectorOptions } from './i18n'

const detector = createNuxtI18nLocaleDetector({
	...defaultAlternateLocateDetectorOptions,
	locales: defaultAlternateLocateDetectorOptions.locales.map((locale) => ({ ...locale })),
})

export default (event: unknown, config?: { defaultLocale?: string }) => detector(event, config)
