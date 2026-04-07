import { createAlternateUIPlugin } from 'alternate-ui/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const uiPrefix = nuxtApp.$config.public.sharedNuxt?.uiPrefix || 'Aui'

  nuxtApp.vueApp.use(createAlternateUIPlugin({
    prefix: uiPrefix,
  }))

  return {
    provide: {
      ui: {
        prefix: uiPrefix,
      },
    },
  }
})
