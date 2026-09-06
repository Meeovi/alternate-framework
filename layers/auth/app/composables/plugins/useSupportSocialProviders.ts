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
      // This project's Vuetify default icon set is Font Awesome (see
      // layers/shared/app/plugins/vuetify.ts), not MDI — 'mdi-google' /
      // 'mdi-github' silently failed to resolve and both buttons rendered
      // with no icon at all.
      { id: 'google', label: 'Google', icon: 'fab fa-google', color: 'red' },
      { id: 'github', label: 'GitHub', icon: 'fab fa-github', color: 'grey-darken-3' },
    ]
  }

  return {
    providers,
    load,
  }
}