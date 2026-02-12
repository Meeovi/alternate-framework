import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(async () => {
  if (typeof window === 'undefined' || !window.document) return

  // Load CSS and plugins only on the client to avoid SSR importing jQuery
  await Promise.all([
    import('lightgallery/css/lightgallery.css'),
    import('lightgallery/css/lg-zoom.css'),
    import('lightgallery/css/lg-thumbnail.css'),
    import('lightgallery/css/lg-video.css')
  ])

  const [{ default: lightGallery }, { default: lgZoom }, { default: lgVideo }, { default: lgThumbnail }] = await Promise.all([
    import('lightgallery'),
    import('lg-zoom'),
    import('lg-video'),
    import('lg-thumbnail')
  ])

  document.querySelectorAll('.lightgallery').forEach((element) => {
    if (!(element instanceof HTMLElement)) return
    lightGallery(element, {
      plugins: [lgZoom, lgVideo, lgThumbnail],
      speed: 500
    })
  })
})