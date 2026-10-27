/**
 * Live site CSS from Directus (globals.custom_css, served at
 * /site/custom.css by server/routes/site/custom.css.get.ts). Linked last in
 * <head> so its rules override the built stylesheets — admins can restyle
 * the site without a rebuild.
 */
export default defineNuxtPlugin(() => {
  useHead({
    link: [{ rel: 'stylesheet', href: '/site/custom.css', key: 'site-custom-css', tagPriority: 'low' }],
  })
})
