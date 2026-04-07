import { defineNuxtPlugin, useHead } from '#imports'

export default defineNuxtPlugin(() => {
  useHead({
    script: [
      {
        type: 'module',
        innerHTML: `
          (function() {
            const STORAGE_KEY = 'elite-theme'
            try {
              const stored = localStorage?.getItem(STORAGE_KEY)
              if (stored && (stored === 'light' || stored === 'dark')) {
                document.documentElement.setAttribute('data-theme', stored)
                return
              }
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
              const theme = prefersDark ? 'dark' : 'light'
              document.documentElement.setAttribute('data-theme', theme)
            } catch (error) {
              // localStorage access might fail; allow natural preference
            }
          })()
        `,
        async: false,
      },
    ],
  })
})
