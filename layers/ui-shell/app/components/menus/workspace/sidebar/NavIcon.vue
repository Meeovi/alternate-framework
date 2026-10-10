<script setup lang="ts">
// Top-level entries get their icon; nested entries get Berry's small dot.
defineProps<{ icon?: string, level?: number }>()
</script>

<template>
  <v-icon v-if="level && level > 0" icon="fas fa-circle" size="5" class="iconClass" />
  <v-icon v-else :icon="icon || 'fas fa-circle'" size="18" class="iconClass" />
</template>
