// plugins/vuetify.ts
import 'vuetify/styles'
// Font Awesome as a webfont (CSS classes), not the SVG/JS packs: every
// `icon="fas fa-*"` (code and CMS menus alike) resolves from the stylesheet,
// and each font file downloads only when a page shows that style. The SVG
// packs (fas + far + fab, ~2,000 icons) were bundled into the entry chunk
// that every page loads.
import '@fortawesome/fontawesome-free/css/all.min.css'
import '../assets/fontawesome-swap.css'
import '../assets/link-colours.css'
import { watch } from 'vue'
import { createVuetify } from 'vuetify'
import { aliases, fa } from 'vuetify/iconsets/fa'
import { faIconAliases } from '@mframework/meeovi-forms/icons'
import { mdi } from 'vuetify/iconsets/mdi'

// Components and directives are NOT registered here: vite-plugin-vuetify's
// autoImport (layers/ui-shell/nuxt.config.ts) imports the ones each
// template uses. Registering `* as components` (+ labs) defeated that and
// shipped all of Vuetify in the entry chunk.

/** The visitor's light/dark choice, readable on the server too: a page is
 *  rendered in that theme instead of light and then switched in the browser
 *  (sections that hydrate later stayed light until they did). */
const THEME_COOKIE = 'meeovi-theme'

export default defineNuxtPlugin(nuxtApp => {
  const themeCookie = useCookie<string | null>(THEME_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax', path: '/' })
  const vuetify = createVuetify({
    ssr: true,
    icons: {
      defaultSet: 'fa',
      aliases: { ...aliases, ...faIconAliases },
      sets: {
        fa,
        mdi,
      },
    },
    theme: {
      defaultTheme: themeCookie.value === 'dark' ? 'dark' : 'light',
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
  nuxtApp.vueApp.use(vuetify)

  // Every way of changing the theme (header switch, settings, system
  // preference on first visit) goes through Vuetify: remember the result.
  if (import.meta.client) {
    watch(() => vuetify.theme.global.name.value, (name) => {
      if (name === 'light' || name === 'dark') themeCookie.value = name
    })
  }
})