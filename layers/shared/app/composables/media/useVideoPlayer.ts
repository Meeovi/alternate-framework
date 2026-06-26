// composables/useVideoPlayer.ts
import { ref, shallowRef, onMounted, onBeforeUnmount } from 'vue'
import { getVideoJsPlugins } from '@/videojs/videojs-plugin-registry'

export function useVideoPlayer(playerConfig) {
  const playerEl = shallowRef(null)
  const videojs = shallowRef(null)
  const player = shallowRef(null)

  const isReady = ref(false)
  const error = ref(null)

  const plugins = getVideoJsPlugins()

  const emitEvent = (name, detail = {}) => {
    window.dispatchEvent(
      new CustomEvent(`videojs:${name}`, { detail })
    )
  }

  onMounted(async () => {
    try {
      // Run plugin beforeCreate hooks
      plugins.forEach(p => p.beforeCreate?.(playerConfig))

      videojs.value = (await import('video.js')).default

      player.value = videojs.value(playerEl.value, playerConfig)

      // Run plugin onCreate hooks
      plugins.forEach(p => p.onCreate?.(player.value, videojs.value))

      const events = [
        'ready', 'play', 'pause', 'ended', 'timeupdate',
        'seeking', 'seeked', 'volumechange', 'ratechange',
        'error', 'fullscreenchange', 'enterpictureinpicture',
        'leavepictureinpicture'
      ]

      events.forEach(evt => {
        player.value.on(evt, () => {
          const data = {
            currentTime: player.value.currentTime(),
            duration: player.value.duration(),
            volume: player.value.volume(),
            rate: player.value.playbackRate(),
            error: player.value.error()
          }

          // nuxt/scripts event
          emitEvent(evt, data)

          // plugin event
          plugins.forEach(p => p.onEvent?.(evt, data, player.value))
        })
      })

      player.value.on('ready', () => {
        isReady.value = true
        plugins.forEach(p => p.onReady?.(player.value))
      })

    } catch (e) {
      error.value = e
    }
  })

  onBeforeUnmount(() => {
    if (player.value) {
      plugins.forEach(p => p.onDestroy?.(player.value))
      player.value.dispose()
    }
  })

  return {
    playerEl,
    player,
    isReady,
    error
  }
}
