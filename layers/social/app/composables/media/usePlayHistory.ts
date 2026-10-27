import { computed } from 'vue'
import { useAsyncData, useRequestFetch } from '#imports'

/**
 * The signed-in account's recently watched vibes / listened radio stations,
 * newest first, for the "Watch again" / "Listen again" rows. Stored per
 * account (server/api/social/play-history); guests have none.
 */
export type PlayHistoryKind = 'watch' | 'listen'

/** Records a play from a vibe or station page. Guests and failures are ignored. */
export function recordPlay(kind: PlayHistoryKind, id: string | number | null | undefined): void {
  if (id === null || id === undefined || id === '') return
  $fetch('/api/social/play-history', { method: 'POST', body: { kind, id: String(id) } }).catch(() => {})
}

/** The history for a row, loaded during SSR: `const history = await usePlayHistory('watch')`. */
export async function usePlayHistory(kind: PlayHistoryKind) {
  // useRequestFetch forwards the session cookie when this runs on the server.
  const request = useRequestFetch()
  const { data } = await useAsyncData(`play-history-${kind}`,
    () => request<{ ids: string[] }>('/api/social/play-history', { query: { kind } }).catch(() => ({ ids: [] })),
    { default: () => ({ ids: [] }) })

  return {
    ids: computed(() => (data.value?.ids ?? []).map(String)),
    /** Drops an item from the row and from the account's history. */
    remove: async (id: string | number) => {
      const key = String(id)
      data.value = { ids: (data.value?.ids ?? []).filter((other) => String(other) !== key) }
      await $fetch(`/api/social/play-history/${kind}/${encodeURIComponent(key)}`, { method: 'DELETE' }).catch(() => {})
    },
  }
}
