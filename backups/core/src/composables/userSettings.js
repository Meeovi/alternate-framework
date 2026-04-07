import { unref } from 'vue';
import { useLocalStorage } from '@vueuse/core';
// Persist settings in localStorage so user preferences survive reloads
const SETTINGS_KEY = 'mframework_user_settings_v1';
const _settings = useLocalStorage(SETTINGS_KEY, {});
export function useUserSettings() {
    return _settings;
}
export function getPreferences(settings, key, defaultValue) {
    const s = unref(settings);
    return s?.[key] ?? defaultValue;
}
export async function togglePreferences(key, value) {
    const s = _settings.value;
    s[key] = value === undefined ? !s[key] : value;
    _settings.value = { ...s };
}
