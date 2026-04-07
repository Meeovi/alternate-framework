import type { SharedMediaProvider } from '../plugins/media.client'

export const useMedia = (): SharedMediaProvider => {
  const { $media } = useNuxtApp()
  return $media
}
