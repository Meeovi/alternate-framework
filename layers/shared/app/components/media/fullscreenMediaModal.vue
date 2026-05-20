<template>
  <v-dialog :model-value="modelValue" max-width="960" @update:model-value="$emit('update:model-value', $event)">
    <v-card v-if="item">
      <v-toolbar density="comfortable">
        <v-toolbar-title>
          {{ file?.title || file?.filename_download || 'Media' }}
        </v-toolbar-title>
        <v-spacer />
        <v-btn icon="mdi-close" @click="$emit('update:model-value', false)" />
      </v-toolbar>

      <template>
        <div v-if="mime.startsWith('image')" class="viewer">
          <img :src="sourceUrl" :alt="file?.title || 'Image'" />
        </div>

        <div v-else-if="mime.startsWith('video')" class="viewer">
          <MediaPlayer :media="file" :options="videoOptions" />
        </div>

        <div v-else-if="mime.startsWith('audio')" class="viewer">
          <MediaPlayer :media="file" :options="audioOptions" />
        </div>

        <div v-else class="viewer">
          <p>Preview not available for this file type.</p>
          <v-btn color="primary" :href="sourceUrl" target="_blank">
            Open file
          </v-btn>
        </div>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {
    computed
  } from '#imports'
  import useMedia from '../../composables/media/useMedia'
  import MediaPlayer from './mediaPlayer.vue'

  const props = defineProps({
    modelValue: Boolean,
    item: Object,
  })
  defineEmits(['update:model-value'])

  const config = useRuntimeConfig()

  const file = computed(() => props.item?.file || props.item || null)
  const mime = computed(() => file.value?.type || '')

  const { fileUrl, playerOptions } = useMedia()

  const videoOptions = computed(() => playerOptions(file.value, 'video/mp4'))
  const audioOptions = computed(() => playerOptions(file.value, 'audio/mpeg'))
  const sourceUrl = computed(() => fileUrl(file.value))
</script>

<style scoped>
  .viewer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .viewer img {
    max-width: 100%;
    max-height: 75vh;
  }
</style>