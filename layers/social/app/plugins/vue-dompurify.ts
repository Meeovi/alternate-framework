export default defineNuxtPlugin((nuxtApp) => {
  const existing = (nuxtApp.vueApp as any)?._context?.directives?.['dompurify-html']
  if (existing) {
    return
  }

  const toHtml = (value: unknown) => (typeof value === 'string' ? value : '')

  nuxtApp.vueApp.directive('dompurify-html', {
    beforeMount(el: any, binding: any) {
      el.innerHTML = toHtml(binding?.value)
    },
    updated(el: any, binding: any) {
      el.innerHTML = toHtml(binding?.value)
    },
    getSSRProps(binding: any) {
      return {
        innerHTML: toHtml(binding?.value),
      }
    },
  })
})
