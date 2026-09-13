<template>
  <v-card :class="mt ? 'mt-4' : ''">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ title }}</span>
      <v-chip
        v-if="status"
        size="small"
        :color="available ? 'success' : 'warning'"
        variant="tonal"
      >
        {{ available ? 'Available' : 'Unavailable' }}
      </v-chip>
      <slot name="title-append" />
    </v-card-title>

    <v-card-text>
      <slot />
    </v-card-text>
  </v-card>
</template>

<script setup>
/**
 * Shared shell for the `/u/` profile cards: title, an optional
 * available/unavailable status chip, and a body slot.
 */
defineProps({
  title: { type: String, required: true },
  // Show the availability chip in the header.
  status: { type: Boolean, default: false },
  available: { type: Boolean, default: false },
  // Add the standard `mt-4` top margin (cards stacked in a column).
  mt: { type: Boolean, default: false },
})
</script>
