<template>
  <v-card :to="`/product/${product?.id}`" max-width="200">
    <v-img :src="src" :alt="product?.name" aspect-ratio="1" cover @error="onError" />
    <v-card-title class="text-body-2">{{ product?.name }}</v-card-title>
  </v-card>
</template>

<script setup>
import { computed } from 'vue'
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { useImageFallback } from '#shared/app/composables/media/useImageFallback'

const props = defineProps({
  product: {
    type: Object,
    required: true,
  },
})

const { src, onError } = useImageFallback(computed(() => getAssetURL(props.product?.image)))
</script>
