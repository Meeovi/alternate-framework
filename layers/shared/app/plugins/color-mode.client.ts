import { useColorMode } from '@vueuse/core'
import { defineNuxtPlugin, useHead } from 'nuxt/app'
import { THEME_COLORS } from 'alternate-ui/tokens'

export default defineNuxtPlugin(() => {
  const colorMode = useColorMode()
  useHead({
    meta: [{
      id: 'theme-color',
      name: 'theme-color',
      content: () => colorMode.value === 'dark' ? THEME_COLORS.themeDark : THEME_COLORS.themeLight,
    }],
  })
})
