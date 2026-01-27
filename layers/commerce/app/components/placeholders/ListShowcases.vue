<template>
  <div class="list-showcases-placeholder">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ list: { type: Object, required: false } })
</script>
