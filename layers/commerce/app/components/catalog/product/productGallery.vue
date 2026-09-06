<template>
  <div class="product-gallery">
    <Gallery
      class="w-full"
      :items="galleryItems"
      empty-text="No product media available."
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue'
  import Gallery from '#shared/app/components/ui/Gallery.vue'

  const props = defineProps<{ assets: Array<{ id: string; preview: string }> }>()

  const galleryItems = computed(() => {
    return (props.assets || [])
      .filter((asset: { id: string; preview: string }) => Boolean(asset?.preview))
      .map((asset: { id: string; preview: string }) => ({
        id: asset.id,
        src: asset.preview,
        thumb: asset.preview,
        alt: 'Product image',
      }))
  })
</script>

<style scoped>
.product-gallery {
  position: relative;
  display: flex;
  width: 100%;
  max-height: 600px;
  aspect-ratio: 4 / 3;
}
</style>
