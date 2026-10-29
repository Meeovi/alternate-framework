import { addServerHandler, addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface WikipediaNewsModuleOptions {
  /** Slug of the space the notes go in. Default meeovi-news. */
  space?: string
  /** Name the notes are shown under. Default "Meeovi News". */
  author?: string
  /** Days back (today included) each run looks at. Default 2. */
  days?: number
  /** Most notes one run adds. Default 50. */
  limit?: number
  /** Import automatically every N minutes; 0 = only when an admin runs it.
   *  Default WIKIPEDIA_NEWS_INTERVAL_MINUTES, else 0. Turn it on for ONE
   *  site only: sites sharing a Directus would import side by side. */
  intervalMinutes?: number
  /** MediaWiki API. Default https://en.wikipedia.org/w/api.php */
  api?: string
  /** Wikimedia asks API clients to name themselves and a contact. */
  userAgent?: string
}

export type { WikipediaNewsModuleOptions as ModuleOptions }

/**
 * @mframework/wikipedia-news — news for a space from Wikipedia's Current
 * events portal: each event becomes a note (credited, CC BY-SA 4.0, with
 * its news sources).
 *
 * - POST /api/admin/wikipedia-news/import { days?, limit? } — admins only.
 * - Optional schedule (intervalMinutes).
 *
 * Writes with the app's Directus token (runtimeConfig.directus.token):
 * posts, tags, and the posts' spaces/tags links.
 */
export default defineNuxtModule<WikipediaNewsModuleOptions>({
  meta: {
    name: 'wikipedia-news',
    configKey: 'wikipediaNews',
    compatibility: { nuxt: '^4.0.0' },
  },
  defaults: {
    space: process.env.WIKIPEDIA_NEWS_SPACE || 'meeovi-news',
    author: 'Meeovi News',
    days: 2,
    limit: 50,
    intervalMinutes: Number(process.env.WIKIPEDIA_NEWS_INTERVAL_MINUTES || 0),
    api: 'https://en.wikipedia.org/w/api.php',
    userAgent: 'Meeovi/1.0 (https://meeovi.com; support@meeovi.com) @mframework/wikipedia-news',
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    // Server-only; NUXT_WIKIPEDIA_NEWS_INTERVAL_MINUTES etc. override at run time.
    runtimeConfig.wikipediaNews = {
      space: options.space || 'meeovi-news',
      author: options.author || 'Meeovi News',
      days: options.days ?? 2,
      limit: options.limit ?? 50,
      intervalMinutes: options.intervalMinutes ?? 0,
      api: options.api || 'https://en.wikipedia.org/w/api.php',
      userAgent: options.userAgent || '',
      ...(runtimeConfig.wikipediaNews || {}),
    }
    addServerHandler({ route: '/api/admin/wikipedia-news/import', method: 'post', handler: resolver.resolve('./runtime/server/api/import.post') })
    addServerPlugin(resolver.resolve('./runtime/server/plugins/schedule'))
  },
})
