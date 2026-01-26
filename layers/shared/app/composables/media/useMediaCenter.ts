import { ref, computed, unref } from 'vue'
import { useNuxtApp } from '#imports'
import useDirectusRequest from '../useDirectusRequest'
import { useAuth } from '~/composables/globals/useAuth'

export function useMediaCenter() {
  // Prefer a BetterAuth `useAuth()` composable when available (provided by the auth layer).
  // Fallback to null if not present so the rest of the composable degrades gracefully.
  // `useAuth()` typically exposes `user` and `session` refs and a `fetchSession()` method.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const auth: any = (globalThis as any).$useAuth ?? (typeof useAuth !== 'undefined' ? useAuth() : null)

  const user = computed(() => {
    if (!auth) return null
    // If auth exposes `user` ref directly
    if (typeof auth.user !== 'undefined') return unref(auth.user) || null
    // If auth exposes `session` ref containing `{ user }`
    if (typeof auth.session !== 'undefined') return unref(auth.session)?.user || null
    return null
  })
  const userId = computed(() => user.value?.id || null)

  const {
    $directus,
    $readItems,
    $createItem,
    $uploadFiles,
  } = useNuxtApp()

  // CORE MEDIA STATE
  const allMedia = ref<any[]>([])
  const isInitialLoading = ref(true)
  const isLoadingMore = ref(false)
  const hasMore = ref(true)
  const limit = 24
  const offset = ref(0)

  // FOLDERS
  const folders = ref<any[]>([])
  const currentFolder = ref<string | null>(null)

  // SHARED & SEARCH
  const sharedWithMe = ref<any[]>([])
  const searchResults = ref<any[]>([])

  // SMART ALBUMS
  const smartAlbums = ref<any[]>([])

  /* ---------- MIME HELPERS ---------- */
  const mime = (i: any) => i?.directus_files_id?.type || ''
  const isAudio = (i: any) => mime(i).startsWith('audio')
  const isVideo = (i: any) => mime(i).startsWith('video')
  const isImage = (i: any) => mime(i).startsWith('image')
  const isText  = (i: any) => mime(i).startsWith('text')
  const isDoc   = (i: any) =>
    [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ].includes(mime(i))

  /* ---------- FILTERED LISTS ---------- */
  const filteredMedia = computed(() => {
    if (!currentFolder.value) return allMedia.value
    return allMedia.value.filter(m => m.folder === currentFolder.value)
  })

  const audioMedia    = computed(() => filteredMedia.value.filter(isAudio))
  const videoMedia    = computed(() => filteredMedia.value.filter(isVideo))
  const imageMedia    = computed(() => filteredMedia.value.filter(isImage))
  const textMedia     = computed(() => filteredMedia.value.filter(isText))
  const documentMedia = computed(() => filteredMedia.value.filter(isDoc))

  /* ---------- RESET PAGINATION ---------- */
  function resetPagination() {
    allMedia.value = []
    offset.value = 0
    hasMore.value = true
  }

  /* ---------- FETCH USER MEDIA (PAGINATED) ---------- */
  async function fetchNextPage() {
    if (!userId.value) {
      isInitialLoading.value = false
      return
    }
    if (!hasMore.value) return

    isLoadingMore.value = true

    const filter: any = { user: { _eq: userId.value } }
    if (currentFolder.value) {
      filter.folder = { _eq: currentFolder.value }
    }

    try {
      const items = await $readItems('media', {
        fields: [
          '*',
          { directus_files_id: ['id', 'type', 'filename_download', 'title'] },
        ],
        filter,
        sort: ['-date_created'],
        limit,
        offset: offset.value,
      })

      if (!items.length) {
        hasMore.value = false
      } else {
        allMedia.value.push(...items)
        offset.value += items.length
        if (items.length < limit) hasMore.value = false
      }
    } finally {
      isLoadingMore.value = false
      isInitialLoading.value = false
    }
  }

  /* ---------- UPLOAD FILES ---------- */
  /**
   * Upload files to Directus and create `media` entries.
   * Uploads are performed one-by-one so callers can track progress.
   *
   * @param files - array of File objects
   * @param onProgress - optional callback called with { index, total, status, name }
   */
  async function uploadFiles(files: File[], onProgress?: (info: { index: number; total: number; status: 'starting' | 'done' | 'error'; name?: string }) => void) {
    if (!userId.value) {
      // Try to fetch session once in case the auth state wasn't loaded yet
      try {
        if (auth && typeof auth.fetchSession === 'function') await auth.fetchSession()
        else if (auth && typeof auth.fetch === 'function') await auth.fetch()
      } catch (_) {}

      if (!userId.value) {
        try {
          const nuxt = useNuxtApp() as any
          const toast = nuxt?.$toast
          if (toast && typeof toast.error === 'function') toast.error('You must be signed in to upload files')
        } catch (_) {}
        throw new Error('User not authenticated')
      }
    }

    const { request } = useDirectusRequest()
    const newItems: any[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file) {
        onProgress && onProgress({ index: i, total: files.length, status: 'error' })
        continue
      }
      try {
        onProgress && onProgress({ index: i, total: files.length, status: 'starting', name: file.name })

        const formData = new FormData()
        formData.append('file', file)

        const resp = await request($uploadFiles(formData))
        const uploaded = Array.isArray(resp) ? resp : (resp ? [resp] : [])

        for (const up of uploaded) {
          const mediaItem = await $createItem('media', {
            user: userId.value,
            directus_files_id: up.id,
            title: up.filename_download || up.title || up.id,
            folder: currentFolder.value || null,
          })

          newItems.push({ ...mediaItem, directus_files_id: up })
        }

        onProgress && onProgress({ index: i, total: files.length, status: 'done', name: file.name })
      } catch (e) {
        onProgress && onProgress({ index: i, total: files.length, status: 'error', name: file.name })
        try {
          const nuxt = useNuxtApp() as any
          const toast = nuxt?.$toast
          if (toast && typeof toast.error === 'function') toast.error(`Upload failed: ${file.name}`)
        } catch (_) {}
        console.error('uploadFiles failed for file', file.name, e)
      }
    }

    if (newItems.length) {
      // add newly created items to the beginning of allMedia
      allMedia.value.unshift(...newItems)
      try {
        const nuxt = useNuxtApp() as any
        const toast = nuxt?.$toast
        if (toast && typeof toast.success === 'function') toast.success(`Uploaded ${newItems.length} file${newItems.length === 1 ? '' : 's'}`)
      } catch (_) {}
    }

    return newItems
  }

  /* ---------- FOLDERS ---------- */
  async function fetchFolders() {
    if (!userId.value) return
    folders.value = await $readItems('folders', {
      filter: { user: { _eq: userId.value } },
      sort: ['sort', 'name'],
    })
  }

  async function createFolder(name: string, parent: string | null = null) {
    await $createItem('folders', {
      name,
      user: userId.value,
      parent_folder: parent,
    })
    await fetchFolders()
  }

  function filterByFolder(folderId: string | null) {
    currentFolder.value = folderId
    resetPagination()
    fetchNextPage()
  }

  async function reorderFolders(updated: any[]) {
    // You can persist a "sort" field here if you add it to folders.
    // Example (pseudo-batched):
    //
    // for (let index = 0; index < updated.length; index++) {
    //   const folder = updated[index]
    //   await $directus.request(
    //     $updateItem('folders', folder.id, { sort: index })
    //   )
    // }
    //
    // For now, we just update local state:
    folders.value = [...updated]
  }

  /* ---------- SHARED WITH ME ---------- */
  async function fetchSharedWithMe() {
    if (!userId.value) return
    sharedWithMe.value = await $readItems('media', {
      fields: [
        '*',
        { directus_files_id: ['id', 'type', 'filename_download', 'title'] },
      ],
      filter: { shared_with: { _contains: userId.value } },
      sort: ['-date_created'],
    })
  }

  /* ---------- SEARCH ---------- */
  async function searchMedia(query: string) {
    if (!query) {
      searchResults.value = []
      return
    }

    searchResults.value = await $readItems('media', {
      fields: [
        '*',
        { directus_files_id: ['id', 'type', 'filename_download', 'title'] },
      ],
      filter: {
        _or: [
          { title: { _icontains: query } },
          { tags: { _icontains: query } },
          {
            directus_files_id: {
              title: { _icontains: query },
            },
          },
        ],
      },
      sort: ['-date_created'],
    })
  }

  /* ---------- SMART ALBUMS ---------- */
  const smartAlbumsComputed = computed(() => {
    const albums: { id: string; label: string; items: any[] }[] = []

    const now = new Date()
    const todayKey = now.toISOString().slice(0, 10)

    const buckets: Record<string, any[]> = {}

    for (const item of allMedia.value) {
      const dateKey = (item.date_created || '').slice(0, 10) || 'unknown'
      const typeBucket = isImage(item)
        ? 'Images'
        : isVideo(item)
        ? 'Videos'
        : isAudio(item)
        ? 'Audio'
        : 'Other'

      const key =
        dateKey === todayKey
          ? `Today / ${typeBucket}`
          : `${dateKey} / ${typeBucket}`

      if (!buckets[key]) buckets[key] = []
      buckets[key].push(item)
    }

    for (const key of Object.keys(buckets)) {
      albums.push({
        id: key,
        label: key,
        items: buckets[key]!,
      })
    }

    return albums
  })

  smartAlbums.value = smartAlbumsComputed.value

  /* ---------- RETURN API ---------- */
  return {
    // state
    allMedia,
    audioMedia,
    videoMedia,
    imageMedia,
    textMedia,
    documentMedia,
    folders,
    currentFolder,
    sharedWithMe,
    searchResults,
    smartAlbums,

    // flags
    isInitialLoading,
    isLoadingMore,
    hasMore,

    // actions
    fetchNextPage,
    uploadFiles,
    fetchFolders,
    createFolder,
    filterByFolder,
    reorderFolders,
    fetchSharedWithMe,
    searchMedia,
  }
}