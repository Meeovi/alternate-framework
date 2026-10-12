<template>
  <v-card class="mx-auto" max-width="400">
    <MeeoviPlayer :src="getAssetURL(short?.video_url || short?.video)"
      :poster="getAssetURL(short?.thumbnail_url || short?.thumbnail)" :title="short?.name" loop />

    {{ short?.name }}

    <div>Type: {{ short?.type }}</div>

    <div>{{ short?.description }}</div>

    <v-btn color="orange" text="View" :href="`/social/vibe/${short?.id}`"></v-btn>
  </v-card>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'

const { short } = defineProps({
  short: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.video-js {
  width: 100%;
  height: 300px;
  position: relative;
  display: block;
}
</style>