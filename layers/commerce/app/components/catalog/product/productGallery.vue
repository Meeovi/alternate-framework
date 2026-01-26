<template>
  <div class="relative flex w-full max-h-[600px] aspect-4/3">
    <v-carousel>
      <v-carousel-item
        v-for="asset in assets"
        :key="asset.id"
        :src="asset.preview"
        cover
      />
    </v-carousel>
  </div>
</template>

<script setup lang="ts">
  const props = defineProps<{ assets: Array<{ id: string; preview: string }> }>();
</script>
