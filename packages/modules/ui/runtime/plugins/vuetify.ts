// plugins/vuetify.ts
import '@mdi/font/css/materialdesignicons.css'

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

// Register fontawesome icons at module scope
library.add(fas)

// Create Vuetify instance at module scope so other runtime plugins can import it
export const vuetify = createVuetify({
  ssr: true,
  directives,
  icons: {
    defaultSet: 'fa',
    aliases,
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
        variables: {}, // required to avoid Vuetify crash
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
        variables: {},
        colors: {},
      },
    },
  },
})

export default (nuxtApp: any) => {
  // Register FontAwesome component on the actual Vue app instance
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon)
  nuxtApp.vueApp.use(vuetify)
}