import { reactive, ref } from 'vue'
import type { mastodon } from '../../clients/mastodon'

export interface TranslationResponse {
  translatedText: string
  detectedLanguage: {
    confidence: number
    language: string
  }
}

export interface TranslationStatus {
  success: boolean
  error: string
  text: string
}

export interface TranslationState extends TranslationStatus {
  visible: boolean
}

export interface TranslationToolsDeps {
  getTranslateApi: () => string | undefined
  useUserSettings: () => { value?: { disabledTranslationLanguages?: string[] } | null }
  getLocaleLanguage?: () => string
  fetchJson: (url: string, init: { method: string, body: Record<string, unknown> }) => Promise<TranslationResponse>
  onError?: (error: unknown) => void
}

interface TranslationErr {
  data?: {
    error?: string
  }
}

// @see https://github.com/LibreTranslate/LibreTranslate/tree/main/libretranslate/locales
export const supportedTranslationCodes = [
  'ar',
  'az',
  'cs',
  'da',
  'de',
  'el',
  'en',
  'eo',
  'es',
  'fa',
  'fi',
  'fr',
  'ga',
  'he',
  'hi',
  'hu',
  'id',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'ru',
  'sk',
  'sv',
  'tr',
  'uk',
  'vi',
  'zh',
] as const

const anchorMarkupRegEx = /<a[^>]*>.*?<\/a>/g

function isTranslationApiSupported() {
  return 'Translator' in globalThis && 'LanguageDetector' in globalThis
}

function replaceTranslatedLinksWithOriginal(text: string) {
  return text.replace(anchorMarkupRegEx, (match) => {
    const tagLink = anchorMarkupRegEx.exec(text)
    return tagLink ? tagLink[0] : match
  })
}

export function createTranslationTools(deps: TranslationToolsDeps) {
  const translations = new WeakMap<mastodon.v1.Status | mastodon.v1.StatusEdit, TranslationState>()

  function getLanguageCode() {
    const getCode = (code: string) => code.replace(/-.*$/, '')
    if (import.meta.client) {
      const current = deps.getLocaleLanguage?.() || navigator.language
      return getCode(current)
    }
    return 'en'
  }

  async function translateText(text: string, from: string | null | undefined, to: string) {
    const status = ref<TranslationStatus>({
      success: false,
      error: '',
      text: '',
    })

    try {
      const translateApi = deps.getTranslateApi()
      if (!translateApi)
        throw new Error('Translate API is not configured.')

      const response = await deps.fetchJson(translateApi, {
        method: 'POST',
        body: {
          q: text,
          source: from ?? 'auto',
          target: to,
          format: 'html',
          api_key: '',
        },
      })

      status.value.success = true
      status.value.text = replaceTranslatedLinksWithOriginal(response.translatedText)
    }
    catch (error) {
      if ((error as TranslationErr).data?.error)
        status.value.error = (error as TranslationErr).data!.error!
      else
        status.value.error = 'Unknown Error, Please check your console in browser devtool.'
      deps.onError?.(error)
    }

    return status
  }

  async function useTranslation(status: mastodon.v1.Status | mastodon.v1.StatusEdit, to: string) {
    if (!translations.has(status))
      translations.set(status, reactive({ visible: false, text: '', success: false, error: '' }))

    const translation = translations.get(status)!
    const userSettings = deps.useUserSettings()
    const disabledLanguages = userSettings.value?.disabledTranslationLanguages || []

    let shouldTranslate = false
    if ('language' in status) {
      shouldTranslate = typeof status.language === 'string' && status.language !== to && !disabledLanguages.includes(status.language)

      if (!isTranslationApiSupported()) {
        shouldTranslate = shouldTranslate && supportedTranslationCodes.includes(to as any)
          && supportedTranslationCodes.includes(status.language as any)
      }
      else {
        shouldTranslate = shouldTranslate && (await (globalThis as any).Translator.availability({
          sourceLanguage: status.language,
          targetLanguage: to,
        })) !== 'unavailable'
      }
    }

    const enabled = shouldTranslate

    async function toggle() {
      if (!shouldTranslate)
        return

      if (!translation.text) {
        let translated = {
          value: {
            error: '',
            text: '',
            success: false,
          },
        }

        if (isTranslationApiSupported() && 'language' in status) {
          let sourceLanguage = status.language
          if (!sourceLanguage) {
            const languageDetector = await (globalThis as any).LanguageDetector.create()
            const div = document.createElement('div')
            div.innerHTML = status.content
            // eslint-disable-next-line unicorn/prefer-dom-node-text-content
            const detectedLanguages = await languageDetector.detect(div.innerText)
            sourceLanguage = detectedLanguages[0].detectedLanguage
            if (sourceLanguage === 'und')
              throw new Error('Could not detect source language.')
          }

          const translator = await (globalThis as any).Translator.create({
            sourceLanguage,
            targetLanguage: to,
          })

          try {
            let text = await translator.translate(status.content)
            text = replaceTranslatedLinksWithOriginal(text)
            translated.value = {
              error: '',
              text,
              success: true,
            }
          }
          catch (error) {
            translated.value = {
              error: (error as Error).message,
              text: '',
              success: false,
            }
          }
        }
        else if ('language' in status) {
          translated = await translateText(status.content, status.language, to)
        }

        translation.error = translated.value.error
        translation.text = translated.value.text
        translation.success = translated.value.success
      }

      translation.visible = !translation.visible
    }

    return {
      enabled,
      toggle,
      translation,
    }
  }

  return {
    getLanguageCode,
    translateText,
    useTranslation,
  }
}