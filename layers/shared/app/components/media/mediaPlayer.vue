<template>
  <div>
    <video ref="videoPlayer" class="video-js"></video>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import useVideojs from '~/composables/media/useVideojs'

defineOptions({ name: 'VideoPlayer' })

const props = defineProps({
  options: {
    type: Object,
    default: () => ({})
  },
  // optional media prop (kept for compatibility)
  media: {
    type: Object,
    required: false
  }
})

const { createPlayer, disposePlayer } = useVideojs()

const videoPlayer = ref(null)
const player = ref(null)

onMounted(() => {
  const p = createPlayer(videoPlayer.value, props.options, function () {
    this.log && this.log('onPlayerReady', this)
  })
  player.value = p
})

onBeforeUnmount(() => {
  disposePlayer(player.value)
})
</script>