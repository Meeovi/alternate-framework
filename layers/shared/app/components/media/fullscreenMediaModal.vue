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

      <v-card-text>
        <div v-if="mime.startsWith('image')" class="viewer">
          <img :src="fileUrl" :alt="file?.title || 'Image'" />
        </div>

        <div v-else-if="mime.startsWith('video')" class="viewer">
          <video :src="fileUrl" controls style="max-width: 100%;" />
        </div>

        <div v-else-if="mime.startsWith('audio')" class="viewer">
          <audio :src="fileUrl" controls style="width: 100%;" />
        </div>

        <div v-else class="viewer">
          <p>Preview not available for this file type.</p>
          <v-btn color="primary" :href="fileUrl" target="_blank">
            Open file
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
  import {
    computed
  } from 'vue'

  const props = defineProps({
    modelValue: Boolean,
    item: Object,
  })
  defineEmits(['update:model-value'])

  const config = useRuntimeConfig()
  const file = computed(() => props.item?.directus_files_id || null)
  const mime = computed(() => file.value?.type || '')
  const fileUrl = computed(() =>
    file.value?.id ? `${config.public.directus.url}/assets/${file.value.id}` : ''
  )
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