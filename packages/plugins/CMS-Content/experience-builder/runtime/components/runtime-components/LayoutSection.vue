<script setup lang="ts">
const props = defineProps<{
  background?: string
  padding?: string
}>()
</script>

<template>
  <section
    class="spaces-layout-section"
    :style="{
      background: props.background || 'transparent',
      padding: props.padding || '2rem'
    }"
  >
    <slot />
  </section>
</template>

<style scoped>
.spaces-layout-section {
  width: 100%;
  box-sizing: border-box;
}
</style>
