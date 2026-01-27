<template>
  <div class="space-placeholder">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ space: { type: Object, required: false } })
</script>
