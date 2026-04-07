<script setup lang="ts">
withDefaults(
  defineProps<{
    src?: string
    image?: string
    autoplay?: boolean
    muted?: boolean
  }>(),
  {
    src: '',
    image: '',
    autoplay: false,
    muted: false,
  },
)
</script>

<template>
  <v-video
    :src="src"
    :image="image"
    :autoplay="autoplay"
    :muted="muted"
    controls
    v-bind="$attrs"
  />
</template>
