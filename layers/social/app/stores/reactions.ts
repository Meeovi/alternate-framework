import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { useRuntimeConfig, useNuxtApp, onNuxtReady } from '#imports'

type ReactionEntry = {
  contentId: string | number
  contentType: string
  likeCount: number
  isLiked: boolean
  userLikeId?: string | null
  loading: boolean
  lastFetched: number
}

type FetcherResult = { likeCount: number; isLiked: boolean; userLikeId?: string | null }
type FetcherFn = (contentId: string | number, contentType: string) => Promise<FetcherResult>
type TogglerFn = (contentId: string | number, contentType: string, currentlyLiked: boolean) => Promise<FetcherResult>

export const useReactionsStore = defineStore('reactions', () => {
  const items = reactive<Record<string, ReactionEntry>>({})
  const runtime = useRuntimeConfig()
  const nuxt = useNuxtApp() as any

  // pluggable fetch/toggle implementations
  let fetcher: FetcherFn | null = null
  let toggler: TogglerFn | null = null

  // EventSource for SSE (optional) — use `any` to avoid lib DOM/SSR type issues
  let es: any = null

  function key(contentId: string | number, contentType = 'posts') {
    return `${contentType}:${contentId}`
  }

  function makeEntry(contentId: string | number, contentType = 'posts') {
    const k = key(contentId, contentType)
    if (!items[k]) {
      items[k] = {
        contentId,
        contentType,
        likeCount: 0,
        isLiked: false,
        loading: false,
        lastFetched: 0,
      }
    }
    return items[k]
  }

  function getItem(contentId: string | number, contentType = 'posts') {
    return makeEntry(contentId, contentType)
  }

  // default fetcher uses a simple REST endpoint under runtime public API base if available
  async function defaultFetcher(contentId: string | number, contentType = 'posts'): Promise<FetcherResult> {
    const base = runtime.public?.apiBase || runtime.public?.directusUrl || ''
    try {
      if (!base) throw new Error('No API base configured for default reactions fetcher')
      // This default expects an endpoint like: `${base}/reactions?contentType=posts&contentId=...`
      const res = await nuxt.$fetch(`${base}/reactions`, {
        params: { contentType, contentId },
      })
      // Expect { likeCount: number, isLiked: boolean }
      return {
        likeCount: res?.likeCount ?? 0,
        isLiked: !!res?.isLiked,
        userLikeId: res?.userLikeId ?? null,
      }
    } catch (e) {
      console.error('defaultFetcher error', e)
      return { likeCount: 0, isLiked: false, userLikeId: null }
    }
  }

  // default toggler uses a POST to /reactions/toggle (best-effort fallback)
  async function defaultToggler(contentId: string | number, contentType = 'posts', currentlyLiked = false): Promise<FetcherResult> {
    const base = runtime.public?.apiBase || runtime.public?.directusUrl || ''
    try {
      if (!base) throw new Error('No API base configured for default reactions toggler')
      const res = await nuxt.$fetch(`${base}/reactions/toggle`, {
        method: 'POST',
        body: { contentType, contentId, like: !currentlyLiked },
      })
      return {
        likeCount: res?.likeCount ?? 0,
        isLiked: !!res?.isLiked,
        userLikeId: res?.userLikeId ?? null,
      }
    } catch (e) {
      console.error('defaultToggler error', e)
      throw e
    }
  }

  // Public API to register custom fetch/toggle implementations
  function initAdapters(options?: { fetcher?: FetcherFn; toggler?: TogglerFn; realtimeUrl?: string }) {
    if (options?.fetcher) fetcher = options.fetcher
    if (options?.toggler) toggler = options.toggler
    if (options?.realtimeUrl) initRealtime(options.realtimeUrl)
  }

  async function fetchReactions(contentId: string | number, contentType = 'posts', force = false) {
    const entry = getItem(contentId, contentType)
    if (!force && Date.now() - entry.lastFetched < 10_000) return entry
    entry.loading = true
    try {
      const fn = fetcher || defaultFetcher
      const data = await fn(contentId, contentType)
      entry.likeCount = data.likeCount ?? entry.likeCount
      entry.isLiked = !!data.isLiked
      if ('userLikeId' in data) entry.userLikeId = data.userLikeId ?? null
      entry.lastFetched = Date.now()
    } catch (e) {
      console.error('fetchReactions failed', e)
    } finally {
      entry.loading = false
    }
    return entry
  }

  // toggle with optimistic update and rollback
  async function toggleLike(contentId: string | number, contentType = 'posts') {
    const entry = getItem(contentId, contentType)
    if (entry.loading) return entry
    entry.loading = true
    const prev = { likeCount: entry.likeCount, isLiked: entry.isLiked }

    // optimistic update
    entry.isLiked = !entry.isLiked
    entry.likeCount = entry.isLiked ? entry.likeCount + 1 : Math.max(0, entry.likeCount - 1)

    try {
      const fn = toggler || defaultToggler
      const data = await fn(contentId, contentType, prev.isLiked)
      entry.likeCount = data.likeCount ?? entry.likeCount
      entry.isLiked = !!data.isLiked
      if ('userLikeId' in data) entry.userLikeId = data.userLikeId ?? null
    } catch (e) {
      // rollback
      entry.likeCount = prev.likeCount
      entry.isLiked = prev.isLiked
      console.error('toggleLike failed', e)
      // try to show toast if available
      try {
        const toast = nuxt?.$toast as any
        if (toast && typeof toast.error === 'function') toast.error('Could not update reaction')
      } catch (_) {}
      throw e
    } finally {
      entry.loading = false
    }
    return entry
  }

  function initRealtime(realtimeUrl: string) {
    // close existing
    if (es) {
      try { es.close() } catch (_) {}
      es = null
    }
    if (!realtimeUrl) return
    try {
      // guard EventSource to client environment
      if (typeof window === 'undefined') return
      es = new EventSource(realtimeUrl)
      es.addEventListener('message', (ev: MessageEvent) => {
        try {
          const payload = JSON.parse(ev.data)
          // expect payload like { type: 'reaction', contentType, contentId, likeCount, isLiked }
          if (payload?.type !== 'reaction') return
          const k = key(payload.contentId, payload.contentType)
          const entry = makeEntry(payload.contentId, payload.contentType)
          if (typeof payload.likeCount === 'number') entry.likeCount = payload.likeCount
          if (typeof payload.isLiked === 'boolean') entry.isLiked = payload.isLiked
        } catch (e) {
          console.error('realtime parse error', e)
        }
      })
      es.addEventListener('error', (e: any) => {
        console.error('EventSource error', e)
      })
    } catch (e) {
      console.error('initRealtime failed', e)
    }
  }

  function closeRealtime() {
    if (es) {
      try { es.close() } catch (_) {}
      es = null
    }
  }

  return {
    getItem,
    fetchReactions,
    toggleLike,
    initAdapters,
    initRealtime,
    closeRealtime,
    // expose raw items for debugging
    items,
  }
})

export default useReactionsStore
