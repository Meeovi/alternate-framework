/**
 * Live site CSS from Directus (globals.custom_css, served at
 * /site/custom.css by server/routes/site/custom.css.get.ts). Linked last in
 * <head> so its rules override the built stylesheets — admins can restyle
 * the site without a rebuild.
 *
 * The link carries the CSS's version (?v=, read during SSR and passed to
 * the browser in the payload), so an edit shows on the next page load
 * instead of waiting out browser and Cloudflare caches.
 */
export default defineNuxtPlugin(async () => {
  const version = useState('site-custom-css-version', () => '')
  if (import.meta.server) {
    version.value = await $fetch<{ version: string }>('/site/custom-css-version')
      .then((res) => res.version)
      .catch(() => '')
  }
  useHead({
    link: [{
      rel: 'stylesheet',
      href: version.value ? `/site/custom.css?v=${version.value}` : '/site/custom.css',
      key: 'site-custom-css',
      tagPriority: 'low',
    }],
  })
})
