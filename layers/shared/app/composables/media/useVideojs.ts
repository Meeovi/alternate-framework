import { useNuxtApp } from '#imports'

/**
 * Composable wrapper for the shared `videojs` Nuxt plugin.
 * Provides access to the provided `videojs` instance and registration helpers.
 */
export default function useVideojs() {
  const nuxtApp = useNuxtApp()

  // Provided by layers/shared-app/app/plugins/videojs.client.js
  const videojs = (nuxtApp as any).$videojs || null
  const registerVideojsPlugin = (nuxtApp as any).$registerVideojsPlugin || ((name: string, plugin: any) => {})
  const registerVideojsPlugins = (nuxtApp as any).$registerVideojsPlugins || ((defs: any) => {})

  function createPlayer(el: Element | string | null, options?: any, ready?: (this: any) => void) {
    if (!videojs) {
      // fallback: try to import dynamically (client-side only)
      // but avoid bundling here; return null instead
      return null
    }
    try {
      return videojs(el as any, options, ready)
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('[useVideojs] createPlayer failed', e)
      return null
    }
  }

  function disposePlayer(player: any) {
    try {
      player && typeof player.dispose === 'function' && player.dispose()
    } catch (e) {
      // ignore
    }
  }

  return {
    videojs,
    registerVideojsPlugin,
    registerVideojsPlugins,
    createPlayer,
    disposePlayer,
  }
}
