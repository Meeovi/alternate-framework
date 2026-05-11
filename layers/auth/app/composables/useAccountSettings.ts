import { computed, onMounted, ref, watch } from 'vue'
import {
  SHARED_ACCOUNT_SETTINGS_PRESETS,
  type AccountSettingDefinition,
  type AccountSettingsCategoryDefinition,
  type AccountSettingsPresetKey,
} from './config/accountSettings'

type UseAccountSettingsOptions = {
  preset?: AccountSettingsPresetKey
  categories?: AccountSettingsCategoryDefinition[]
  settings?: AccountSettingDefinition[]
}

export function useAccountSettings(options: UseAccountSettingsOptions = {}) {
  const auth = useAuth()
  const runtimeConfig = useRuntimeConfig()

  const preset = computed<AccountSettingsPresetKey>(() =>
    options.preset && SHARED_ACCOUNT_SETTINGS_PRESETS[options.preset] ? options.preset : 'default',
  )

  const categories = computed(
    () => options.categories || SHARED_ACCOUNT_SETTINGS_PRESETS[preset.value].categories,
  )
  const settings = computed(() => options.settings || SHARED_ACCOUNT_SETTINGS_PRESETS[preset.value].settings)

  const isLoggedIn = computed(() => auth.loggedIn.value)
  const userEmail = computed(() => auth.user.value?.email || 'Signed in')

  const backendLabel = computed(() =>
    String((runtimeConfig.public as any)?.auth?.backend || 'better-auth').toLowerCase(),
  )
  const supportsPersistentSettings = computed(() => backendLabel.value === 'better-auth')

  const profile = ref<any>(null)
  const backendAvailableSettings = ref<string[] | null>(null)
  const activeCategory = ref('accounts')
  const savingKey = ref<string | null>(null)
  const saveError = ref('')
  const saveSuccess = ref('')

  const userMeta = computed<Record<string, any>>(() => {
    const data = profile.value?.raw_user_meta_data
    return data && typeof data === 'object' ? data : {}
  })

  const accountSettings = computed<Record<string, boolean>>(() => {
    const candidate = userMeta.value.settings
    return candidate && typeof candidate === 'object' ? candidate : {}
  })

  const availableSettingRules = computed(() => {
    const appMeta = profile.value?.raw_app_meta_data
    if (!appMeta || typeof appMeta !== 'object') return null
    return appMeta.availableSettings ?? null
  })

  function getNestedRule(source: any, path: string): any {
    if (!source || typeof source !== 'object') return undefined
    return path.split('.').reduce((acc: any, segment: string) => {
      if (!acc || typeof acc !== 'object') return undefined
      return acc[segment]
    }, source)
  }

  function isSettingAvailable(key: string): boolean {
    if (Array.isArray(backendAvailableSettings.value) && backendAvailableSettings.value.length > 0) {
      return backendAvailableSettings.value.includes(key)
    }

    const rules = availableSettingRules.value

    if (Array.isArray(rules)) {
      return rules.includes(key)
    }

    if (rules && typeof rules === 'object') {
      const direct = rules[key]
      if (typeof direct === 'boolean') return direct
      const nested = getNestedRule(rules, key)
      if (typeof nested === 'boolean') return nested
    }

    return true
  }

  const visibleSettings = computed(() => settings.value.filter((setting) => isSettingAvailable(setting.key)))

  const visibleCategories = computed(() => {
    const inUse = new Set(visibleSettings.value.map((setting) => setting.category))
    return categories.value.filter((category) => inUse.has(category.id))
  })

  const activeCategoryLabel = computed(() => {
    const current = visibleCategories.value.find((category) => category.id === activeCategory.value)
    return current?.label || 'Settings'
  })

  const visibleSettingsForActiveCategory = computed(() =>
    visibleSettings.value.filter((setting) => setting.category === activeCategory.value),
  )

  function getSettingValue(key: string, fallback = false): boolean {
    const value = accountSettings.value[key]
    return typeof value === 'boolean' ? value : fallback
  }

  function applyVisualSetting(key: string, value: boolean) {
    if (key !== 'personalization.darkMode') return
    if (typeof document === 'undefined') return
    document.documentElement.setAttribute('data-theme', value ? 'dark' : 'light')
  }

  async function toggleSetting(key: string, value: boolean, fallback = false) {
    if (!isLoggedIn.value || !supportsPersistentSettings.value) return

    saveError.value = ''
    saveSuccess.value = ''
    savingKey.value = key

    const nextSettings = {
      ...accountSettings.value,
      [key]: typeof value === 'boolean' ? value : fallback,
    }

    const nextRawUserMeta = {
      ...userMeta.value,
      settings: nextSettings,
    }

    try {
      const response = await $fetch<{ profile: any; availableSettings?: string[] }>('/api/profile/route', {
        method: 'PUT',
        body: {
          raw_user_meta_data: nextRawUserMeta,
        },
      })

      profile.value = response?.profile || profile.value
      backendAvailableSettings.value = Array.isArray(response?.availableSettings)
        ? response.availableSettings
        : backendAvailableSettings.value
      saveSuccess.value = 'Saved'
      applyVisualSetting(key, value)

      setTimeout(() => {
        saveSuccess.value = ''
      }, 1200)
    } catch (err: any) {
      saveError.value = err?.data?.statusMessage || err?.message || 'Failed to save setting'
    } finally {
      savingKey.value = null
    }
  }

  async function loadProfile() {
    if (!isLoggedIn.value || !supportsPersistentSettings.value) return

    try {
      await auth.fetchSession()
      const data = await $fetch<{ profile: any; availableSettings?: string[] }>('/api/profile/route')
      profile.value = data?.profile || null
      backendAvailableSettings.value = Array.isArray(data?.availableSettings) ? data.availableSettings : null
    } catch {
      profile.value = null
      backendAvailableSettings.value = null
    }
  }

  function ensureActiveCategory() {
    if (!visibleCategories.value.find((category) => category.id === activeCategory.value)) {
      activeCategory.value = visibleCategories.value[0]?.id || 'accounts'
    }
  }

  onMounted(async () => {
    if (!auth.session.value) {
      await auth.fetchSession()
    }

    await loadProfile()
    ensureActiveCategory()
  })

  watch(visibleCategories, () => {
    ensureActiveCategory()
  })

  return {
    categories,
    settings,
    isLoggedIn,
    userEmail,
    backendLabel,
    supportsPersistentSettings,
    activeCategory,
    savingKey,
    saveError,
    saveSuccess,
    visibleCategories,
    activeCategoryLabel,
    visibleSettingsForActiveCategory,
    getSettingValue,
    toggleSetting,
    loadProfile,
  }
}
