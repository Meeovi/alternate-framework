import {
  createTranslationTools,
  supportedTranslationCodes,
  type TranslationResponse,
  type mastodon,
} from '@mframework/adapter-federation'
import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
import { useUserSettings } from '../../settings/storage'

export { supportedTranslationCodes }
export type { TranslationResponse }

const translationTools = createTranslationTools({
  getTranslateApi: () => (useRuntimeConfig().public.translateApi as string | undefined),
  useUserSettings: () => ({ value: { disabledTranslationLanguages: [] } }),
  getLocaleLanguage: () => {
    const { locale } = useLocate()
    return locale.value || navigator.language
  },
  fetchJson: (url, init) => ($fetch as any)(url, init),
  onError: error => console.error('Translate Post Error: ', error),
})

export function getLanguageCode() {
  return translationTools.getLanguageCode()
}

export async function translateText(text: string, from: string | null | undefined, to: string) {
  return await translationTools.translateText(text, from, to)
}

export async function useTranslation(status: mastodon.v1.Status | mastodon.v1.StatusEdit, to: string) {
  return await translationTools.useTranslation(status, to)
}
