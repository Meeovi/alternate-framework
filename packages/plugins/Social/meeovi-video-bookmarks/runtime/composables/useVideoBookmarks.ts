import { useRuntimeConfig } from '#imports'

export type VideoPreview = {
  provider: string
  providerLabel: string
  url: string
  embedUrl: string
  title: string
  description: string
  author: string | null
  thumbnail: string | null
  /** Already on Meeovi: its product key. */
  existing: string | null
}

export type AddedVideo = { key: string, sku: string, pendingApproval: boolean, problems: string[] }

/** The API's reason for a refusal (adult link, unsupported site, …), else a fallback. */
export function videoErrorMessage(error: any, fallback = 'Something went wrong. Please try again.'): string {
  return error?.data?.statusMessage || error?.statusMessage || error?.data?.message || fallback
}

/** Video bookmarks API (@mframework/meeovi-video-bookmarks). */
export function useVideoBookmarks() {
  const config = (useRuntimeConfig().public.meeoviVideoBookmarks ?? {}) as { apiBase?: string, providers?: Record<string, string>, categoryPath?: string, manageProductsPath?: string }
  const base = config.apiBase || '/api/video-bookmarks'
  return {
    providers: config.providers ?? {},
    categoryPath: config.categoryPath || '/departments/category/videos',
    manageProductsPath: config.manageProductsPath || '/workspace/catalog/my-products',
    productPath: (key: string) => `/product/${encodeURIComponent(key)}`,
    preview: (url: string) => $fetch<VideoPreview>(`${base}/preview`, { method: 'POST', body: { url } }),
    add: (input: { url: string, name: string, description?: string }) => $fetch<AddedVideo>(base, { method: 'POST', body: input }),
  }
}
