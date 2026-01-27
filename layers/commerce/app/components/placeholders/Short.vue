<template>
  <div class="short-placeholder">
    <slot />
  </div>
</template>

<script setup lang="ts">
const props = defineProps({ short: { type: Object, required: false } })
</script>
