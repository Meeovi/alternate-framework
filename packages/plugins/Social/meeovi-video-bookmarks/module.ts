import { addComponent, addImports, addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'
import { PROVIDER_LABELS } from './runtime/server/providers'

export interface MeeoviVideoBookmarksOptions {
  /** API routes. Default /api/video-bookmarks. */
  apiBase?: string
  /** The department and category linked videos are listed in. Default Theater → Videos. */
  departmentSlug?: string
  categorySlug?: string
  /** Videos a seller can add per 24 hours (admins aren't limited). Default 30. */
  dailyLimit?: number
  /** More words or phrases that mark a video as adult (on top of the built-in list). */
  blockedTerms?: string[]
  /** More adult hosts (example.com also blocks its subdomains). */
  blockedHosts?: string[]
  /** Where sellers manage their products (shown after adding a video). */
  manageProductsPath?: string
}

export type { MeeoviVideoBookmarksOptions as ModuleOptions }

/**
 * @mframework/meeovi-video-bookmarks — sellers add videos to the site by
 * pasting a link from YouTube, Vimeo, Dailymotion, TikTok or PeerTube. A
 * linked video becomes a free product in the store (Mage-OS, under the
 * seller) in Theater → Videos, beside uploaded videos, and opens on the
 * product page with the platform's player (`<VideoEmbed>`; the page reads
 * the product's video_link_* fields).
 *
 * Every link is checked before anything is created: adult hosts,
 * addresses, titles, descriptions, channels and tags are refused, as are
 * videos the platform flags adult/age-restricted/NSFW
 * (runtime/server/safety.ts, providers.ts); the store's product approval
 * follows.
 *
 * Runtime env: YOUTUBE_API_KEY (optional: YouTube's age restriction is
 * checked only with a key), VIDEO_BOOKMARKS_BLOCKED_TERMS /
 * VIDEO_BOOKMARKS_BLOCKED_HOSTS (comma lists). The store is reached through
 * the app's Directus (public.directus.url + directus.token).
 */
export default defineNuxtModule<MeeoviVideoBookmarksOptions>({
  meta: { name: 'meeovi-video-bookmarks', configKey: 'meeoviVideoBookmarks', compatibility: { nuxt: '^4.0.0' } },
  defaults: {
    apiBase: '/api/video-bookmarks',
    departmentSlug: 'theater',
    categorySlug: 'videos',
    dailyLimit: 30,
    blockedTerms: [],
    blockedHosts: [],
    manageProductsPath: '/workspace/catalog/my-products',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const apiBase = (options.apiBase || '/api/video-bookmarks').replace(/\/+$/, '')

    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    runtimeConfig.public.meeoviVideoBookmarks = {
      apiBase,
      providers: PROVIDER_LABELS,
      categoryPath: `/departments/category/${options.categorySlug || 'videos'}`,
      manageProductsPath: options.manageProductsPath || '/workspace/catalog/my-products',
    }
    // Empty strings, not undefined: a key that's undefined at build is dropped
    // and its NUXT_* override then never applies.
    runtimeConfig.meeoviVideoBookmarks = {
      departmentSlug: options.departmentSlug || 'theater',
      categorySlug: options.categorySlug || 'videos',
      dailyLimit: options.dailyLimit ?? 30,
      blockedTerms: options.blockedTerms ?? [],
      blockedHosts: options.blockedHosts ?? [],
      youtubeApiKey: '',
    }

    addServerHandler({ route: `${apiBase}/preview`, method: 'post', handler: resolver.resolve('./runtime/server/api/preview.post') })
    addServerHandler({ route: apiBase, method: 'post', handler: resolver.resolve('./runtime/server/api/index.post') })

    addImports({ name: 'useVideoBookmarks', from: resolver.resolve('./runtime/composables/useVideoBookmarks') })
    addComponent({ name: 'AddVideoLink', filePath: resolver.resolve('./runtime/components/AddVideoLink.vue') })
    addComponent({ name: 'VideoEmbed', filePath: resolver.resolve('./runtime/components/VideoEmbed.vue') })
  },
})
