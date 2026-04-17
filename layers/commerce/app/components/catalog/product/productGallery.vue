<template>
  <div class="relative flex w-full max-h-[600px] aspect-4/3">
    <Gallery
      class="w-full"
      :items="galleryItems"
      empty-text="No product media available."
    />
  </div>
</template>

<script setup lang="ts">
  import { computed } from '#imports'
  import Gallery from '#shared/app/components/ui/Gallery.vue'

  const props = defineProps<{ assets: Array<{ id: string; preview: string }> }>()

  const galleryItems = computed(() => {
    return (props.assets || [])
      .filter((asset) => Boolean(asset?.preview))
      .map((asset) => ({
        id: asset.id,
        src: asset.preview,
        thumb: asset.preview,
        alt: 'Product image',
      }))
  })
</script>
