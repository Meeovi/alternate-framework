import { ref, computed, watch, useAsyncData, useRequestFetch } from '#imports'

// Client side of the Pixanomy content sections
// (layers/social/app/components/features/pixSections/*). Talks only to the
// auth-gated, user-scoped server endpoints under
// /api/social/pixanomy/* — never $directus directly.
//
// Server counterparts:
//   GET  /api/social/pixanomy/content?category=&page=&limit=&sort=
//   GET  /api/social/pixanomy/featured?limit=
//   POST /api/social/pixanomy/view      { id }
// See layers/social/server/utils/pixanomy.ts.

// media.category value  ->  UI metadata for the section. The keys here are
// the contract with the server (isPixanomyCategory) and with each
// component file name:
//   imaging.vue → imaging, video.vue → video, 3d.vue → 3d,
//   design.vue → design, generative-ai.vue → generative_ai,
//   document.vue → document
export type PixanomyCategory =
  | 'imaging'
  | 'video'
  | '3d'
  | 'design'
  | 'generative_ai'
  | 'document'

export const PIXANOMY_CATEGORIES: PixanomyCategory[] = [
  'imaging',
  'video',
  '3d',
  'design',
  'generative_ai',
  'document',
]

export interface PixanomyCategoryMeta {
  slug: PixanomyCategory
  label: string
  icon: string
  description: string
}

export const PIXANOMY_CATEGORY_META: Record<PixanomyCategory, PixanomyCategoryMeta> = {
  imaging: {
    slug: 'imaging',
    label: 'Imaging',
    icon: 'fas fa-image',
    description: 'Photos and images you have uploaded.',
  },
  video: {
    slug: 'video',
    label: 'Video',
    icon: 'fas fa-video',
    description: 'Videos you have created or uploaded.',
  },
  '3d': {
    slug: '3d',
    label: '3D',
    icon: 'fas fa-cube',
    description: 'Your 3D models and renders.',
  },
  design: {
    slug: 'design',
    label: 'Design',
    icon: 'fas fa-pen-nib',
    description: 'Designs and templates you have made.',
  },
  generative_ai: {
    slug: 'generative_ai',
    label: 'Generative AI',
    icon: 'fas fa-wand-magic-sparkles',
    description: 'Images you have generated with AI.',
  },
  document: {
    slug: 'document',
    label: 'Documents',
    icon: 'fas fa-file-lines',
    description: 'Documents you have authored.',
  },
}

export interface PixanomyMediaItem {
  id: string | number
  name?: string
  title?: string
  filename_download?: string
  type?: string
  folder?: string | number | null
  category?: PixanomyCategory
  date_created?: string
  views: number
  likeCount: number
  liked: boolean
  // `media` scalar fields pass through untouched.
  [key: string]: unknown
}

export interface PixanomyContentPage {
  category: PixanomyCategory
  items: PixanomyMediaItem[]
  page: number
  limit: number
  total: number
  hasMore: boolean
}

export interface PixanomyFeaturedResponse {
  items: Array<PixanomyMediaItem & { score: number }>
  limit: number
  weights: { like: number; view: number }
}

export type PixanomySort = 'date_created' | '-date_created' | 'name' | '-name' | 'views' | '-views'

/**
 * Low-level accessors. Thin wrappers over the endpoints; no reactive state.
 */
export function usePixanomyContent() {
  // useRequestFetch (not $fetch): these endpoints are behind requireAuth,
  // and useAsyncData runs them on the server during SSR — a bare $fetch to
  // an internal route doesn't forward the incoming session cookie, so the
  // handler would 401. useRequestFetch forwards request headers on the
  // server and is plain $fetch on the client. (Same class of bug as
  // MEMORY: better-auth-usesession-usefetch-ssr.)
  const request = useRequestFetch()

  const fetchCategory = (
    category: PixanomyCategory,
    opts: { page?: number; limit?: number; sort?: PixanomySort } = {},
  ) =>
    request<PixanomyContentPage>('/api/social/pixanomy/content', {
      query: {
        category,
        page: opts.page ?? 1,
        limit: opts.limit ?? 24,
        sort: opts.sort ?? '-date_created',
      },
    })

  const fetchFeatured = (opts: { limit?: number } = {}) =>
    request<PixanomyFeaturedResponse>('/api/social/pixanomy/featured', {
      query: { limit: opts.limit ?? 12 },
    })

  // Fire-and-forget: view tracking is a non-critical side effect, so a
  // failed call is swallowed rather than surfaced.
  const recordView = async (id: string | number) => {
    try {
      return await request<{ counted: boolean; views?: number }>('/api/social/pixanomy/view', {
        method: 'POST',
        body: { id },
      })
    } catch {
      return { counted: false }
    }
  }

  return { fetchCategory, fetchFeatured, recordView }
}

/**
 * Section helper for a single category component: SSR-friendly first page
 * via useAsyncData, plus client-side `loadMore` pagination.
 */
export function usePixanomySection(
  category: PixanomyCategory,
  opts: { limit?: number; sort?: PixanomySort } = {},
) {
  const limit = opts.limit ?? 24
  const sort = opts.sort ?? '-date_created'
  const { fetchCategory } = usePixanomyContent()

  // First page comes from useAsyncData so it renders on SSR and survives
  // hydration (the handler is NOT re-run on the client — `data` is the
  // hydrated payload). Pages 2+ are appended client-side in `morePages`.
  const { data, pending, error, refresh } = useAsyncData(
    `pixanomy:${category}`,
    () => fetchCategory(category, { page: 1, limit, sort }),
  )

  const morePages = ref<PixanomyMediaItem[]>([])
  const page = ref(1)
  const serverHasMore = ref(false)
  const loadingMore = ref(false)

  // Fires on SSR and again on hydration with the payload — either way it
  // resets pagination to match a freshly (re)loaded first page.
  watch(
    data,
    (d) => {
      morePages.value = []
      page.value = d?.page ?? 1
      serverHasMore.value = d?.hasMore ?? false
    },
    { immediate: true },
  )

  const items = computed<PixanomyMediaItem[]>(() => [
    ...(data.value?.items ?? []),
    ...morePages.value,
  ])
  const total = computed(() => data.value?.total ?? 0)
  const hasMore = computed(() => serverHasMore.value)

  const loadMore = async () => {
    if (loadingMore.value || !serverHasMore.value) return
    loadingMore.value = true
    try {
      const res = await fetchCategory(category, { page: page.value + 1, limit, sort })
      morePages.value = [...morePages.value, ...res.items]
      page.value = res.page
      serverHasMore.value = res.hasMore
    } finally {
      loadingMore.value = false
    }
  }

  return {
    items,
    total,
    page,
    hasMore,
    pending,
    loadingMore,
    error,
    isEmpty: computed(() => !pending.value && items.value.length === 0),
    loadMore,
    refresh,
    meta: PIXANOMY_CATEGORY_META[category],
  }
}
