import type { LocaleObject } from 'alternate-locate'
import { computed, unref, type Ref } from 'vue'
import { DEFAULT__PREFERENCES_SETTINGS, getDefaultUserSettings, type FontSize, type OldFontSize, type PreferencesSettings, type UserSettings } from './definition'
import { STORAGE_KEY_SETTINGS } from '../../constants'
import { oldFontSizeMap } from '../../constants/options'
import { useNuxtApp } from 'nuxt/app'
import { useUserLocalStorage } from '../contacts/users'

export function useUserSettings() {
  const { locales } = useNuxtApp().$i18n as { locales: Ref<LocaleObject[]> | LocaleObject[] }
  const supportLanguages = (unref(locales) as LocaleObject[]).map(locale => locale.code)
  const settingsStorage = useUserLocalStorage<UserSettings>(STORAGE_KEY_SETTINGS, () => getDefaultUserSettings(supportLanguages))

  // Backward compatibility, font size was xs, sm, md, lg, xl before
  if (settingsStorage.value.fontSize && !settingsStorage.value.fontSize.includes('px'))
    settingsStorage.value.fontSize = oldFontSizeMap[settingsStorage.value.fontSize as OldFontSize] as FontSize

  return settingsStorage
}

// TODO: refactor & simplify this

export function usePreferences<T extends keyof PreferencesSettings>(name: T): Ref<PreferencesSettings[T]> {
  const userSettings = useUserSettings()
  return computed({
    get() {
      return getPreferences(userSettings.value, name)
    },
    set(value) {
      userSettings.value.preferences[name] = value
    },
  })
}

export function getPreferences<T extends keyof PreferencesSettings>(userSettings: UserSettings, name: T): PreferencesSettings[T] {
  const preference = userSettings?.preferences?.[name] ?? DEFAULT__PREFERENCES_SETTINGS[name]

  if (name === 'enableAutoplay')
    return getPreferences(userSettings, 'enableDataSaving') ? false : preference

  return preference
}

export function togglePreferences(key: keyof PreferencesSettings) {
  const flag = usePreferences(key)
  flag.value = !flag.value
}
