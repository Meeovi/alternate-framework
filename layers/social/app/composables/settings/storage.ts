import { useStorage } from '@vueuse/core'
import { computed } from 'vue'
import type { PreferencesSettings, UserSettings } from './definition'
import { defaultUserSettings } from './definition'

const SETTINGS_KEY = 'social:user-settings'

export function useUserSettings() {
  return useStorage<UserSettings>(SETTINGS_KEY, { ...defaultUserSettings, preferences: { ...defaultUserSettings.preferences } }, localStorage)
}

export function usePreferences() {
  const settings = useUserSettings()
  return computed(() => settings.value.preferences)
}

export function getPreferences(settings: UserSettings | undefined, key: keyof PreferencesSettings) {
  return Boolean(settings?.preferences?.[key])
}

export function togglePreferences(key: keyof PreferencesSettings) {
  const settings = useUserSettings()
  settings.value.preferences[key] = !settings.value.preferences[key]
}
