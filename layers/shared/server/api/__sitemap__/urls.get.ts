import { defineEventHandler } from 'h3'

// nuxt.config.ts's sitemap.sources lists this exact path — the module fetches
// it and expects a plain array of URLs back. layers/shared has no content
// collections of its own (that's app/CMS-specific), so this returns an empty
// array by default rather than 404ing, which is what happened before this
// route existed. A consuming app that has real dynamic routes (blog posts,
// products, ...) can add its own server route at this same path — Nitro
// resolves the app-level route over the layer's, overriding this default.
export default defineEventHandler((): string[] => {
  return []
})
