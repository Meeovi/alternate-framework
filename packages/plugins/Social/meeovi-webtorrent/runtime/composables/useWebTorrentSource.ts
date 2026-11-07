// The address a player should use for a video: its peer-to-peer stream when
// the member opted in to WebTorrent and the stream is running, else the
// original. Falls back to the original on any problem (no WebRTC or service
// worker, the torrent can't be made, nothing within a few seconds).
//
//   const p2p = useWebTorrentSource(() => videoUrl)
//   <MeeoviPlayer :src="p2p.src.value" />  <WebTorrentPeers :source="p2p" />
import { computed, onBeforeUnmount, onMounted, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import { useRuntimeConfig, useState } from '#imports'

type Status = 'off' | 'starting' | 'p2p' | 'fallback'

type WebTorrentClient = {
  add(torrent: Uint8Array, opts: Record<string, unknown>, onTorrent: (t: any) => void): any
  createServer(opts: { controller: ServiceWorkerRegistration }): unknown
  _server?: unknown
  on(event: string, cb: (e: any) => void): void
}

const START_TIMEOUT_MS = 10_000
const CLIENT_URL: string = '/_webtorrent/webtorrent.min.js'
let clientPromise: Promise<WebTorrentClient> | null = null

async function workerRegistration(mode: 'pwa' | 'own'): Promise<ServiceWorkerRegistration | null> {
  if (mode === 'own') {
    const existing = await navigator.serviceWorker.getRegistration('/')
    const ours = existing?.active?.scriptURL?.includes('/_webtorrent/sw.min.js')
    if (existing && !ours) return null // another worker owns the site; don't replace it
    await navigator.serviceWorker.register('/_webtorrent/sw.min.js', { scope: '/' })
  }
  const ready = await Promise.race([
    navigator.serviceWorker.ready,
    new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
  ])
  // The page must be controlled for the player's requests to reach the worker.
  return ready?.active && navigator.serviceWorker.controller ? ready : null
}

async function client(mode: 'pwa' | 'own'): Promise<WebTorrentClient> {
  clientPromise ??= (async () => {
    const registration = await workerRegistration(mode)
    if (!registration) throw new Error('no service worker')
    // Served as a static file (module.ts), not bundled: only loaded for members who opted in.
    const { default: WebTorrent } = await import(/* @vite-ignore */ CLIENT_URL)
    const c: WebTorrentClient = new WebTorrent()
    c.on('error', (e: any) => console.warn('[webtorrent]', e?.message || e))
    c.createServer({ controller: registration })
    return c
  })().catch((error) => { clientPromise = null; throw error })
  return clientPromise
}

export function useWebTorrentSource(source: MaybeRefOrGetter<string | null | undefined>) {
  const config = (useRuntimeConfig().public as any).webtorrent as { serviceWorker: 'pwa' | 'own' } | undefined
  // Whether the member turned it on (Settings → Accounts); null until known.
  const enabled = useState<boolean | null>('meeovi-webtorrent-enabled', () => null)
  const p2pSrc = ref<string | null>(null)
  const peers = ref(0)
  const status = ref<Status>('off')
  let torrent: any = null
  let peerTimer: ReturnType<typeof setInterval> | undefined
  let run = 0

  function stop() {
    run++
    clearInterval(peerTimer)
    if (torrent) { try { torrent.destroy() } catch { /* already gone */ } }
    torrent = null
    p2pSrc.value = null
    peers.value = 0
  }

  async function start() {
    stop()
    const src = toValue(source)
    if (!enabled.value || !src || !config || !('serviceWorker' in navigator) || typeof RTCPeerConnection === 'undefined') {
      status.value = 'off'
      return
    }
    const mine = run
    status.value = 'starting'
    const fallback = () => { if (mine === run) { stop(); status.value = 'fallback' } }
    const timer = setTimeout(fallback, START_TIMEOUT_MS)
    try {
      const res = await fetch(`/api/webtorrent/torrent?src=${encodeURIComponent(src)}`)
      if (!res.ok) throw new Error(`torrent ${res.status}`)
      const file = new Uint8Array(await res.arrayBuffer())
      const c = await client(config.serviceWorker)
      if (mine !== run) return
      torrent = c.add(file, { destroyStoreOnDestroy: true }, (t: any) => {
        if (mine !== run) return
        const media = [...t.files].sort((a: any, b: any) => b.length - a.length)[0]
        if (!media) return fallback()
        clearTimeout(timer)
        p2pSrc.value = media.streamURL
        status.value = 'p2p'
        peerTimer = setInterval(() => { peers.value = t.numPeers ?? 0 }, 2000)
      })
      torrent?.on?.('error', fallback)
    } catch (error) {
      clearTimeout(timer)
      console.info('[webtorrent] using the normal stream:', (error as Error)?.message || error)
      fallback()
    }
  }

  onMounted(async () => {
    if (enabled.value === null) {
      enabled.value = await $fetch<{ networks: { id: string, connected: boolean }[] }>('/api/social/federation/connections')
        .then((r) => r.networks.some((n) => n.id === 'webtorrent' && n.connected))
        .catch(() => false)
    }
    watch([() => toValue(source), enabled], start, { immediate: true })
  })
  onBeforeUnmount(stop)

  return {
    /** Give this to the player. */
    src: computed(() => p2pSrc.value || toValue(source) || null),
    status,
    peers,
    enabled,
  }
}

export type WebTorrentSource = ReturnType<typeof useWebTorrentSource>
