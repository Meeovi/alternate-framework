<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    items?: Array<{ id: string; label: string; value: number; color?: string }>
  }>(),
  {
    title: 'Distribution',
    items: () => [
      { id: 'design', label: 'Design', value: 35, color: '#1f88d6' },
      { id: 'engineering', label: 'Engineering', value: 45, color: '#0f766e' },
      { id: 'ops', label: 'Ops', value: 20, color: '#f97316' },
    ],
  },
)
</script>

<template>
  <v-pie
    :title="title"
    :items="items"
    item-key="id"
    item-title="label"
    item-value="value"
    legend
    v-bind="$attrs"
  />
</template>
