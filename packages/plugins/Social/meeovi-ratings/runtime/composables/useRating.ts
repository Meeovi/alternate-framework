import { computed, onMounted, reactive, ref, toValue, watch, type MaybeRefOrGetter } from 'vue'
import type { MeeoviRatingsPublicConfig, RatingSummary, RatingsBatchResponse } from '../types'

// Client-side store shared by every <MeeoviRating> on the page. Requests made
// in the same tick are batched into one GET {apiBase}?items=… (≤100 a call),
// so a feed of cards costs one request, not one per card.
const store = reactive<Record<string, RatingSummary>>({})
const signedIn = ref(false)
const queue = new Set<string>()
let timer: ReturnType<typeof setTimeout> | null = null

function apiBase() {
  const config = useRuntimeConfig().public.meeoviRatings as MeeoviRatingsPublicConfig | undefined
  return config?.apiBase || '/api/ratings'
}

async function flush(base: string) {
  timer = null
  const keys = [...queue]
  queue.clear()
  for (let i = 0; i < keys.length; i += 100) {
    try {
      const res = await $fetch<RatingsBatchResponse>(base, { query: { items: keys.slice(i, i + 100).join(',') } })
      signedIn.value = res.signedIn
      Object.assign(store, res.items)
    } catch { /* leave unrated; the stars just show empty */ }
  }
}

function request(key: string, base: string) {
  queue.add(key)
  if (!timer) timer = setTimeout(() => flush(base), 20)
}

/** Rating summary for one item, plus rate / clear. Loads after mount. */
export function useRating(type: MaybeRefOrGetter<string>, id: MaybeRefOrGetter<string | number | null | undefined>) {
  const base = apiBase()
  const key = computed(() => {
    const i = toValue(id)
    return i === null || i === undefined || i === '' ? '' : `${toValue(type)}:${i}`
  })
  const load = () => { if (key.value && !store[key.value]) request(key.value, base) }
  onMounted(load)
  watch(key, load)

  const summary = computed(() => (key.value ? store[key.value] : undefined))
  const saving = ref(false)

  async function write(method: 'PUT' | 'DELETE', rating?: number) {
    if (!key.value) return
    const [t, ...rest] = key.value.split(':')
    saving.value = true
    try {
      store[key.value] = await $fetch<RatingSummary>(`${base}/${encodeURIComponent(t!)}/${encodeURIComponent(rest.join(':'))}`, {
        method,
        body: method === 'PUT' ? { rating } : undefined,
      })
    } finally {
      saving.value = false
    }
  }

  return {
    summary,
    signedIn,
    saving,
    rate: (rating: number) => write('PUT', rating),
    clear: () => write('DELETE'),
  }
}
