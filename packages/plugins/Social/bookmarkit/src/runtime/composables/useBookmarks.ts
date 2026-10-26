import { computed } from 'vue'
import { useAsyncData, useRequestFetch, useRuntimeConfig } from '#imports'
import type { Bookmark, BookmarkFolder, BookmarkInput, BookmarksResponse, BookmarkitPublicConfig, FolderInput } from '../types'

/**
 * The signed-in user's bookmarks and folders, shared by every caller (one
 * fetch per page). Each change saves on the server, then reloads.
 *
 *   const { bookmarks, folders, add, update, remove } = useBookmarks()
 *   await add({ url: 'https://nuxt.com', title: 'Nuxt' })
 */
export function useBookmarks() {
  const { apiBase } = useRuntimeConfig().public.bookmarkit as BookmarkitPublicConfig
  const request = useRequestFetch()

  const { data, status, error, refresh } = useAsyncData<BookmarksResponse>(
    'bookmarkit',
    () => request<BookmarksResponse>(apiBase),
    { default: () => ({ folders: [], bookmarks: [] }) },
  )

  const statusCode = computed(() => (error.value as { statusCode?: number } | null | undefined)?.statusCode)
  const signedIn = computed(() => statusCode.value !== 401)
  const folders = computed<BookmarkFolder[]>(() => data.value?.folders ?? [])
  const bookmarks = computed<Bookmark[]>(() => data.value?.bookmarks ?? [])

  const call = async <T>(path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: object): Promise<T> => {
    const result = await $fetch<T>(`${apiBase}${path}`, { method, ...(body ? { body } : {}) })
    await refresh()
    return result
  }

  return {
    folders,
    bookmarks,
    status,
    error,
    signedIn,
    refresh,
    add: (input: BookmarkInput) => call<Bookmark>('', 'POST', input),
    update: (id: number, changes: Partial<BookmarkInput>) => call<Bookmark>(`/${id}`, 'PATCH', changes),
    remove: (id: number) => call<null>(`/${id}`, 'DELETE'),
    addFolder: (input: FolderInput) => call<BookmarkFolder>('/folders', 'POST', input),
    updateFolder: (id: number, changes: Partial<FolderInput>) => call<BookmarkFolder>(`/folders/${id}`, 'PATCH', changes),
    removeFolder: (id: number) => call<null>(`/folders/${id}`, 'DELETE'),
  }
}

/** "https://www.nuxt.com/docs" → "nuxt.com" */
export function bookmarkHost(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
