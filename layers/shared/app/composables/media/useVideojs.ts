type VideoJsLike = {
  dispose?: () => void
  play?: () => Promise<void> | void
  pause?: () => void
  src?: (value?: any) => any
}

type VideoJsFactory = (element: Element, options?: any, ready?: () => void) => VideoJsLike

function resolveVideoJs(): VideoJsFactory | null {
  if (typeof window === 'undefined') return null
  const maybe = (window as any).videojs
  return typeof maybe === 'function' ? maybe : null
}

function createFallbackPlayer(element: any, options?: any, ready?: () => void): VideoJsLike {
  const videoEl = element as HTMLVideoElement | null
  if (videoEl && options?.controls !== false) {
    videoEl.controls = true
  }
  if (videoEl && options?.autoplay) {
    videoEl.autoplay = true
  }
  if (videoEl && options?.sources?.[0]?.src) {
    videoEl.src = options.sources[0].src
  }
  if (typeof ready === 'function') {
    setTimeout(() => ready.call(videoEl), 0)
  }

  return {
    play: () => videoEl?.play?.(),
    pause: () => videoEl?.pause?.(),
    dispose: () => {
      if (!videoEl) return
      videoEl.pause?.()
      videoEl.removeAttribute('src')
      videoEl.load?.()
    },
  }
}

export default function useVideojs() {
  function createPlayer(element: Element, options?: any, ready?: () => void): VideoJsLike {
    const videojs = resolveVideoJs()
    if (videojs) return videojs(element, options, ready)
    return createFallbackPlayer(element, options, ready)
  }

  function disposePlayer(player?: VideoJsLike | null) {
    if (!player) return
    if (typeof player.dispose === 'function') {
      player.dispose()
      return
    }
    if (typeof player.pause === 'function') player.pause()
  }

  return {
    createPlayer,
    disposePlayer,
  }
}
