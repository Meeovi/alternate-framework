import { computed, toValue } from 'vue'
import type { MaybeRefOrGetter } from 'vue'
import { useFetch, useRuntimeConfig } from '#imports'
import type { GalleryMediaItem, GalleryRecentResponse, MeeoviGalleryPublicConfig } from '../types'

export type GalleryMediaType = 'media' | 'image' | 'video' | 'audio'

/**
 * The signed-in user's latest uploads with their public links.
 *
 *   const { media, signedIn } = useGalleryMedia({ limit: 12, type: 'media' })
 *
 * Client-only: personal media is never rendered into (or cached in) the
 * shared SSR HTML. Guests get a 401, so `signedIn` is false and `media` empty.
 */
export function useGalleryMedia(options: { limit?: MaybeRefOrGetter<number>, type?: MaybeRefOrGetter<GalleryMediaType> } = {}) {
  const { apiBase } = useRuntimeConfig().public.meeoviGallery as MeeoviGalleryPublicConfig
  const query = computed(() => ({ limit: toValue(options.limit) ?? 12, type: toValue(options.type) ?? 'media' }))

  const { data, status, error, refresh } = useFetch<GalleryRecentResponse>(`${apiBase}/recent`, {
    query,
    server: false,
    lazy: true,
    key: computed(() => `meeovi-gallery-recent-${query.value.type}-${query.value.limit}`),
  })

  const statusCode = computed(() => (error.value as { statusCode?: number } | null | undefined)?.statusCode)
  return {
    media: computed<GalleryMediaItem[]>(() => data.value?.media ?? []),
    signedIn: computed(() => statusCode.value !== 401),
    status,
    error,
    refresh,
  }
}
