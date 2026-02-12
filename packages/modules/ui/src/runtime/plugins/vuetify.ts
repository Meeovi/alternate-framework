import { defineNuxtPlugin, useRuntimeConfig } from 'nuxt/app'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const theme = config.public.mframeworkUi?.theme || 'light'

  const vuetify = createVuetify({
    components,
    directives,
    theme: {
      defaultTheme: theme,
      themes: {
        light: {
          dark: false,
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b'
          }
        },
        dark: {
          dark: true,
          colors: {
            primary: '#3b82f6',
            secondary: '#64748b'
          }
        }
      }
    }
  })

  nuxtApp.vueApp.use(vuetify)
})