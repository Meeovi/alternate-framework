import { ref, unref, Ref } from 'vue'
import { useLocalStorage } from '@vueuse/core'

export type UserSettings = Record<string, any>

// Persist settings in localStorage so user preferences survive reloads
const SETTINGS_KEY = 'mframework_user_settings_v1'
const _settings = useLocalStorage<UserSettings>(SETTINGS_KEY, {})

export function useUserSettings(): Ref<UserSettings> {
  return _settings
}

export function getPreferences(settings: UserSettings | Ref<UserSettings>, key: string, defaultValue?: any) {
  const s = unref(settings as any)
  return s?.[key] ?? defaultValue
}

export async function togglePreferences(key: string, value?: any): Promise<void> {
  const s = _settings.value
  s[key] = value === undefined ? !s[key] : value
  _settings.value = { ...s }
}
