<template>
  <span class="tag-placeholder">{{ tag?.name || tag }}</span>
</template>

<script setup lang="ts">
const props = defineProps({ tag: { type: Object, required: false } })
</script>
