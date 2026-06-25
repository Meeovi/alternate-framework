// plugins/vuetify.ts
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { faIconAliases } from '@mframework/ui-forms'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

library.add(fas, far)

export default defineNuxtPlugin(nuxtApp => {
  const vuetify = createVuetify({
    ssr: true,
    directives,
    icons: {
      defaultSet: 'fa',
      aliases: { ...aliases, ...faIconAliases },
      sets: {
        fa,
        mdi,
      },
    },
    components: {
      ...components,
      ...labsComponents,
    },
    theme: {
      defaultTheme: 'light',
      themes: {
        light: {
          dark: false,
          variables: {}, // ✅ this property is required to avoid Vuetify crash
          colors: {
            primary: '#6200EE',
            'primary-darken-1': '#3700B3',
            secondary: '#03DAC6',
            'secondary-darken-1': '#018786',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
          },
        },
        dark: {
          dark: true,
          variables: {}, // ✅ this property is required to avoid Vuetify crash
          colors: {},
        },
      },
    },
  })
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
  nuxtApp.vueApp.use(vuetify)
})