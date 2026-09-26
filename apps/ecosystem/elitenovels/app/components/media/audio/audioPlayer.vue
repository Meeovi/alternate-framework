<template>
  <div>
    <video ref="videoRef" class="video-js vjs-default-skin" controls></video>
  </div>
</template>

<script setup>
import { useVideoJs } from '~/composables/media/video';
import { useWavesurfer } from '~/composables/media/plugins/useWavesurfer';

const videoOptions = {
  controls: true,
  bigPlayButton: false,
  autoplay: false,
  loop: false,
  fluid: false,
  width: 600,
  height: 300,
  plugins: {
    wavesurfer: {}, // Placeholder for wavesurfer options (overridden by useWavesurfer)
  },
};

// Pass the useWavesurfer composable as a plugin with custom options if needed
const { videoRef } = useVideoJs(videoOptions, [
  useWavesurfer({
    backend: 'MediaElement',
    displayMilliseconds: true,
    debug: true,
    waveColor: 'grey',
    progressColor: 'black',
    cursorColor: 'black',
    hideScrollbar: true,
  }),
]);
</script>

<style scoped>
/* Add any custom styles for video.js here */
</style>
