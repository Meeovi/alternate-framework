import { addComponent, addImports, addServerHandler, addServerPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export interface MeeoviWebtorrentModuleOptions {
  /** WebSocket trackers peers find each other through. Default
   *  WEBTORRENT_TRACKERS (comma-separated), else openwebtorrent + webtorrent.dev.
   *  The site's CSP must allow them in connect-src (layers/shared does). */
  trackers?: string[]
  /** Hosts videos may be shared from (the web seed falls back to them).
   *  Default WEBTORRENT_SOURCE_HOSTS, else app.pixanomy.com and DIRECTUS_URL's host. */
  sourceHosts?: string[]
  /** Largest video turned into a torrent, in bytes. Default 300 MB. */
  maxBytes?: number
  /** Register WebTorrent in the social layer's federation core, so members
   *  can opt in from Settings → Accounts. Default true. */
  federation?: boolean
}

export type { MeeoviWebtorrentModuleOptions as ModuleOptions }

export const DEFAULT_TRACKERS = ['wss://tracker.openwebtorrent.com', 'wss://tracker.webtorrent.dev']

const hostOf = (url: string | undefined): string[] => { try { return url ? [new URL(url).hostname] : [] } catch { return [] } }
const list = (value: string | undefined) => String(value || '').split(',').map((s) => s.trim()).filter(Boolean)

/**
 * @mframework/meeovi-webtorrent — peer-to-peer playback for M Framework.
 *
 * Members who opt in (Settings → Accounts) stream videos from other viewers
 * over WebTorrent (WebRTC) and share what they watch, with the original
 * file as the web seed, so playback never depends on peers being there.
 *
 *  - /_webtorrent/*: the WebTorrent browser client and its service-worker
 *    handler (vendored, MIT), loaded only for members who opted in.
 *  - GET /api/webtorrent/torrent?src=<video URL>: the video's .torrent
 *    (built once, cached), web seed = /api/webtorrent/seed/<id>.
 *  - useWebTorrentSource(src): the address to give the player — the P2P
 *    stream when it's working, else the original — with a peer count.
 *  - <WebTorrentPeers>: "P2P · 3 peers".
 */
export default defineNuxtModule<MeeoviWebtorrentModuleOptions>({
  meta: { name: 'meeovi-webtorrent', configKey: 'meeoviWebtorrent', compatibility: { nuxt: '^4.0.0' } },
  defaults: {
    trackers: list(process.env.WEBTORRENT_TRACKERS).length ? list(process.env.WEBTORRENT_TRACKERS) : DEFAULT_TRACKERS,
    // Pixanomy (where uploads live) and the CMS (older vibez are Directus assets).
    sourceHosts: list(process.env.WEBTORRENT_SOURCE_HOSTS).length
      ? list(process.env.WEBTORRENT_SOURCE_HOSTS)
      : ['app.pixanomy.com', ...hostOf(process.env.DIRECTUS_URL)],
    maxBytes: Number(process.env.WEBTORRENT_MAX_BYTES) || 300 * 1024 * 1024,
    federation: true,
  },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url)
    const runtimeConfig = nuxt.options.runtimeConfig as Record<string, any>
    const trackers = (options.trackers ?? DEFAULT_TRACKERS).filter((t) => /^wss:\/\//.test(t))

    // Which service worker serves the P2P streams: the PWA's (it imports
    // WebTorrent's handler, below) or, where the build has no PWA service
    // worker (dev), WebTorrent's own.
    const pwa = (nuxt.options as any).pwa
    const pwaActive = !!pwa && pwa.disable !== true && (!nuxt.options.dev || pwa.devOptions?.enabled === true)
    runtimeConfig.public.webtorrent = { trackers, serviceWorker: pwaActive ? 'pwa' : 'own' }
    // WEBTORRENT_SEED_ORIGIN: where peers fetch the web seed, when not the site's own address (dev, staging).
    runtimeConfig.meeoviWebtorrent = { sourceHosts: options.sourceHosts ?? [], maxBytes: options.maxBytes, trackers, seedOrigin: process.env.WEBTORRENT_SEED_ORIGIN || '' }

    nuxt.hook('nitro:config', (nitroConfig) => {
      const nitro = nitroConfig as any
      nitro.publicAssets ||= []
      nitro.publicAssets.push({ dir: resolver.resolve('./runtime/public'), baseURL: '/_webtorrent', maxAge: 60 * 60 * 24 * 7 })
      nitro.routeRules ||= {}
      // WebTorrent's own worker (dev) controls the whole site, so it can
      // answer the player's /webtorrent/… requests.
      nitro.routeRules['/_webtorrent/sw.min.js'] = { headers: { 'service-worker-allowed': '/', 'cache-control': 'no-cache' } }
    })
    // The PWA's generated service worker also answers /webtorrent/… streams.
    ;(nuxt.hook as any)('pwa:beforeBuildServiceWorker', (resolved: any) => {
      if (resolved?.strategies !== 'generateSW' || !resolved.workbox) return
      resolved.workbox.importScripts = [...(resolved.workbox.importScripts ?? []), '/_webtorrent/sw.min.js']
    })

    addServerHandler({ route: '/api/webtorrent/torrent', method: 'get', handler: resolver.resolve('./runtime/server/api/torrent.get') })
    addServerHandler({ route: '/api/webtorrent/seed/:id', method: 'get', handler: resolver.resolve('./runtime/server/api/seed/[id].get') })
    if (options.federation !== false) addServerPlugin(resolver.resolve('./runtime/server/network'))

    addImports({ name: 'useWebTorrentSource', from: resolver.resolve('./runtime/composables/useWebTorrentSource') })
    addComponent({ name: 'WebTorrentPeers', filePath: resolver.resolve('./runtime/components/WebTorrentPeers.vue') })
  },
})
