import { computed, ref } from 'vue'

export type SocialProviderUi = {
  id: string
  label: string
  icon: string
  color: string
}

const PROVIDER_UI: Record<string, Omit<SocialProviderUi, 'id'>> = {
  github: { label: 'GitHub', icon: 'mdi-github', color: 'green' },
  google: { label: 'Google', icon: 'mdi-google', color: 'red' },
  microsoft: { label: 'Microsoft', icon: 'mdi-microsoft', color: 'blue' },
  twitter: { label: 'Twitter', icon: 'mdi-twitter', color: 'light-blue' },
  discord: { label: 'Discord', icon: 'mdi-discord', color: 'indigo' },
}

const toUi = (id: string): SocialProviderUi => {
  const normalized = String(id || '').trim().toLowerCase()
  const known = PROVIDER_UI[normalized]
  if (known) {
    return { id: normalized, ...known }
  }

  return {
    id: normalized,
    label: normalized.charAt(0).toUpperCase() + normalized.slice(1),
    icon: 'mdi-account-circle-outline',
    color: 'primary',
  }
}

export function useSupportedSocialProviders() {
  const config = useRuntimeConfig()
  const backend = computed(() => String((config.public as any)?.auth?.backend || 'better-auth').toLowerCase())

  const providers = ref<SocialProviderUi[]>([])
  const loading = ref(false)

  const load = async () => {
    if (backend.value !== 'better-auth') {
      providers.value = []
      return
    }

    loading.value = true
    try {
      const response = await $fetch<{ providers?: string[] }>('/api/auth/social-providers')
      const ids = Array.isArray(response?.providers) ? response.providers : []
      providers.value = ids.map(toUi)
    } catch {
      providers.value = []
    } finally {
      loading.value = false
    }
  }

  return {
    providers,
    loading,
    load,
  }
}
