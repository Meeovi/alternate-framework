export default defineNuxtPlugin((nuxtApp) => {
  const existing = (nuxtApp.vueApp as any)?._context?.directives?.['dompurify-html']
  if (existing) {
    return
  }

  nuxtApp.vueApp.directive('dompurify-html', {
    // Provide SSR directive support so server rendering does not crash when
    // templates use v-dompurify-html.
    getSSRProps(binding: any) {
      return {
        innerHTML: typeof binding?.value === 'string' ? binding.value : '',
      }
    },
  })
})
