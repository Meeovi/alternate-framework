import { createAlternateUIPlugin } from 'alternate-ui/vue'

export default defineNuxtPlugin((nuxtApp) => {
  const sharedNuxt = (nuxtApp.$config.public as any)?.sharedNuxt as { uiPrefix?: string } | undefined
  const uiPrefix = sharedNuxt?.uiPrefix || 'Aui'

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
