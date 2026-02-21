import { computed } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

export function useMedia() {
  const config = useRuntimeConfig()
  const base = (config?.public?.directus as any)?.url || ''

  function _unwrap(item: any) {
    return item?.directus_files_id ?? item ?? null
  }

  function fileUrl(itemOrFile: any) {
    const f = _unwrap(itemOrFile)
    return f?.id ? `${base.replace(/\/$/, '')}/assets/${f.id}` : ''
  }

  function thumbnailUrl(itemOrFile: any) {
    const f = _unwrap(itemOrFile)
    return f?.id ? `${base.replace(/\/$/, '')}/assets/${f.id}?key=thumbnail` : ''
  }

  function playerOptions(itemOrFile: any, overrideType?: string) {
    const f = _unwrap(itemOrFile)
    const src = fileUrl(f)
    const type = (f && (f.type || overrideType)) || undefined
    return {
      sources: src ? [{ src, type }] : [],
      controls: true,
      preload: 'metadata',
    }
  }

  return {
    fileUrl,
    thumbnailUrl,
    playerOptions,
    baseUrl: computed(() => base),
  }
}

export default useMedia
