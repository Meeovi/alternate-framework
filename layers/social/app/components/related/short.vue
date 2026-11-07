<template>
  <v-card class="mx-auto" max-width="400">
    <MeeoviPlayer :src="getAssetURL(short?.video_url || short?.video)"
      :poster="getImageURL(short?.thumbnail_url || short?.thumbnail)" :title="short?.name" loop />

    {{ short?.name }}

    <div>Type: {{ short?.type }}</div>

    <div>{{ short?.description }}</div>

    <v-btn color="orange" text="View" :href="`/connect/vibe/${short?.id}`"></v-btn>
    <v-chip v-if="productCount" :to="`/connect/vibe/${short?.id}`" size="small" color="orange" variant="tonal"
      prepend-icon="fas fa-bag-shopping" class="ml-1">
      {{ productCount }} {{ productCount === 1 ? 'product' : 'products' }}
    </v-chip>
    <watchLaterBtn :short-id="short?.id" />
  </v-card>
</template>

<script setup>
import { getAssetURL, getImageURL } from '#shared/app/utils/get-asset-url'
import watchLaterBtn from '../features/watchLater/watchLaterBtn.vue'
import { useVibeProductCount } from '../../composables/vibez/useVibeProducts'

const { short } = defineProps({
  short: {
    type: Object,
    required: true,
  },
})
const productCount = useVibeProductCount(short?.id)
</script>

<style scoped>
.video-js {
  width: 100%;
  height: 300px;
  position: relative;
  display: block;
}
</style>