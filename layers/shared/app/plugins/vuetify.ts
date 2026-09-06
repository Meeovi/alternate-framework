// plugins/vuetify.ts
import 'vuetify/styles'
// @fortawesome/vue-fontawesome renders raw <svg class="svg-inline--fa ...">
// elements directly (no auto CSS injection, unlike the plain fontawesome.js
// webfont/CSS kit) — without this stylesheet, .svg-inline--fa has no
// `display` rule of its own and every icon rendered through the `fa`
// iconset below (icon="fas fa-*") computes to `display: none`, i.e.
// present in the DOM with correct path data but fully invisible. See
// https://docs.fontawesome.com/web/use-with/vue for why this import is
// required when autoAddCss isn't enabled (the Vite/Nuxt-bundled default).
import '@fortawesome/fontawesome-svg-core/styles.css'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa-svg'
import { faIconAliases } from '@mframework/meeovi-forms'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'
import * as components from 'vuetify/components'
import * as labsComponents from 'vuetify/labs/components'
import * as directives from 'vuetify/directives'
import { mdi } from 'vuetify/iconsets/mdi'

// fab (brands) was missing — the only icons that ever needed it were the
// Google/GitHub social-login buttons, so it silently failed with "Could
// not find one or more icon(s)" and both buttons rendered with no icon.
library.add(fas, far, fab)

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
            accent: '#B02564',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
          },
        },
        // Was `colors: {}`, which left every brand/semantic token to fall
        // back to Vuetify's stock dark defaults — components that reference
        // `primary`/`accent`/etc. looked off-brand in dark mode. Mirrors the
        // light palette with dark-appropriate lightness.
        dark: {
          dark: true,
          variables: {}, // ✅ this property is required to avoid Vuetify crash
          colors: {
            primary: '#BB86FC',
            'primary-darken-1': '#9A67EA',
            secondary: '#03DAC6',
            'secondary-darken-1': '#018786',
            accent: '#E0518D',
            error: '#CF6679',
            info: '#64B5F6',
            success: '#81C784',
            warning: '#FFB74D',
          },
        },
      },
    },
  })
  nuxtApp.vueApp.component('font-awesome-icon', FontAwesomeIcon as any);
  (nuxtApp.vueApp as any).use(vuetify)
})