import { ref } from 'vue'

type SocialProvider = {
  id: string
  label: string
  icon?: string
  color?: string
}

const providers = ref<SocialProvider[]>([])

export function useSupportedSocialProviders() {
  async function load() {
    providers.value = [
      { id: 'google', label: 'Google', icon: 'mdi-google', color: 'red' },
      { id: 'github', label: 'GitHub', icon: 'mdi-github', color: 'grey-darken-3' },
    ]
  }

  return {
    providers,
    load,
  }
}
