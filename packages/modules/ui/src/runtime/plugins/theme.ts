import {
  defineNuxtPlugin,
  useRuntimeConfig
} from 'nuxt/app'
import {
  useTheme
} from 'vuetify'

export default defineNuxtPlugin(() => {
  if (process.server) return

  const theme = useTheme()
  const config = useRuntimeConfig()

  const baseColors = {
    primary: 'var(--m-primary)',
    secondary: 'var(--m-secondary)',
    accent: 'var(--m-accent)',
    surface: 'var(--m-surface)',
    background: 'var(--m-muted)',
    border: 'var(--m-border)',

    // Required Vuetify system colors
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',


    // Vuetify internal required fields
    'on-primary': '#ffffff',
    'on-secondary': '#ffffff',
    'on-surface': '#ffffff',
    'on-background': '#ffffff',
    'on-success': '#ffffff',
    'on-warning': '#ffffff',
    'on-error': '#ffffff',
    'on-info': '#ffffff'
  }

  const defaultTheme = config.public.mframeworkUi?.theme || 'light'

  theme.global.name.value = defaultTheme

  theme.themes.value = {
    light: {
      dark: false,
      colors: baseColors,
      variables: {}
    },
    dark: {
      dark: true,
      colors: baseColors,
      variables: {}
    }
  }
})