import { computed, ref, watch, type Ref } from 'vue'

/**
 * Shoppable vibez (server/utils/vibeProducts.ts): a vibe's tagged products,
 * whether the signed-in member can change them, and the ones whose card
 * should be showing at the current playback time.
 */
export type VibeProduct = {
  id: number
  start: number | null
  end: number | null
  product: Record<string, any>
}

export type VibeTag = { product: string | number, start?: number | null, end?: number | null }

/** How long a timed card stays up when it has no end time. */
export const DEFAULT_PIN_SECONDS = 6

/**
 * `base`: '/api/social/vibez' for a vibe, '/api/social/videos' for a Video
 * product ("Products in this video", keyed by its product key).
 */
export function useVibeProducts(shortId: Ref<string | number | null | undefined>, base = '/api/social/vibez') {
  const url = () => `${base}/${encodeURIComponent(String(shortId.value))}/products`
  const items = ref<VibeProduct[]>([])
  const canEdit = ref(false)
  const loading = ref(false)
  const error = ref('')

  async function refresh() {
    if (!shortId.value) { items.value = []; canEdit.value = false; return }
    loading.value = true
    try {
      const res = await $fetch<{ canEdit: boolean, items: VibeProduct[] }>(url())
      items.value = res.items
      canEdit.value = res.canEdit
    } catch {
      items.value = []
    } finally {
      loading.value = false
    }
  }

  async function save(tags: VibeTag[]) {
    error.value = ''
    try {
      const res = await $fetch<{ canEdit: boolean, items: VibeProduct[] }>(url(), { method: 'PUT', body: { tags } })
      items.value = res.items
      return true
    } catch (e: any) {
      error.value = e?.data?.statusMessage || e?.statusMessage || "Those products didn't save. Please try again."
      return false
    }
  }

  watch(shortId, refresh, { immediate: true })
  return { items, canEdit, loading, error, refresh, save }
}

/** The timed products whose card is up at `time` (seconds). */
export function activePins(items: VibeProduct[], time: number): VibeProduct[] {
  return items.filter((item) => item.start !== null && time >= item.start
    && time < (item.end ?? item.start + DEFAULT_PIN_SECONDS))
}

export function useActivePins(items: Ref<VibeProduct[]>, time: Ref<number>) {
  const dismissed = ref<Set<number>>(new Set())
  return {
    pins: computed(() => activePins(items.value, time.value).filter((item) => !dismissed.value.has(item.id)).slice(0, 2)),
    dismiss: (id: number) => { dismissed.value = new Set([...dismissed.value, id]) },
  }
}

/** 75 → "1:15". */
export function formatSeconds(value: number | null | undefined): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return ''
  const total = Math.max(0, Math.floor(value))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

/** "1:15", "75" or "1:02:03" → seconds; '' → null; NaN when unreadable. */
export function parseSeconds(text: string): number | null {
  const value = text.trim()
  if (!value) return null
  if (!/^\d+(:\d{1,2}){0,2}(\.\d+)?$/.test(value)) return Number.NaN
  return value.split(':').reduce((sum, part) => sum * 60 + Number(part), 0)
}

// Feed cards' "🛍 N" chips: ids asked for in the same tick share one request.
const counts = new Map<string, Ref<number>>()
let pending = new Set<string>()
let flushTimer: ReturnType<typeof setTimeout> | undefined

async function flushCounts() {
  const ids = [...pending]
  pending = new Set()
  for (let i = 0; i < ids.length; i += 60) {
    const chunk = ids.slice(i, i + 60)
    const res = await $fetch<Record<string, number>>('/api/social/vibez/product-counts', { query: { ids: chunk.join(',') } }).catch(() => ({} as Record<string, number>))
    for (const id of chunk) counts.get(id)!.value = res[id] ?? 0
  }
}

/** How many products are tagged on a vibe (0 until known; client only). */
export function useVibeProductCount(shortId: string | number | null | undefined): Ref<number> {
  const id = String(shortId ?? '')
  if (!/^\d+$/.test(id) || import.meta.server) return ref(0)
  let count = counts.get(id)
  if (!count) {
    count = ref(0)
    counts.set(id, count)
    pending.add(id)
    clearTimeout(flushTimer)
    flushTimer = setTimeout(flushCounts, 0)
  }
  return count
}
