<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '../../utils/sanitize'

const props = defineProps<{
  html: string
}>()

const safeHtml = computed(() => sanitizeHtml(props.html || ''))
</script>

<template>
  <div
    class="spaces-rich-text"
    v-html="safeHtml"
  />
</template>

<style scoped>
.spaces-rich-text {
  line-height: 1.6;
}
.spaces-rich-text :deep(a) {
  color: #2563eb;
}
</style>
