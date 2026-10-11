<script setup lang="ts">
// Entries with an icon (e.g. "fas fa-star" from Directus) show it; nested
// entries, and entries without one, get Berry's small dot.
defineProps<{ icon?: string, level?: number }>()
</script>

<template>
  <v-icon v-if="icon && !(level && level > 0)" :icon="icon" size="18" class="iconClass" />
  <span v-else class="iconClass d-inline-flex justify-center" style="width: 18px">
    <v-icon icon="fas fa-circle" size="5" />
  </span>
</template>
