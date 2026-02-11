import { defineNuxtPlugin } from '#app'
import { useVuetify } from 'vuetify-nuxt-module/runtime'

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = useVuetify()

  // If Vuetify isn't ready yet, skip plugin initialization
  if (!vuetify || !vuetify.framework) {
    console.warn('[mframework-ui] Vuetify not ready for icon-switcher plugin')
    return
  }

  const stored =
    typeof localStorage !== 'undefined'
      ? localStorage.getItem('mframework-icon-set')
      : null

  const initial = stored || 'mdi'

  vuetify.framework.icons = vuetify.framework.icons || {}
  vuetify.framework.icons.defaultSet = initial

  const setIconSet = (name: string) => {
    vuetify.framework.icons.defaultSet = name
    localStorage.setItem('mframework-icon-set', name)
  }

  nuxtApp.provide('mIcons', {
    setIconSet,
    current: () => vuetify.framework.icons.defaultSet
  })
})