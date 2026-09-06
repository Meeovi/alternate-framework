<template>
  <div v-if="label" class="text-center">
    <v-chip class="ma-2" label :to="to">
      #{{ label }}
    </v-chip>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tag: {
    type: Object,
    required: true,
  },
})

// The parent's tag relation isn't always populated (e.g. a product with a
// hashtag reference that wasn't expanded) — without a name or slug there's
// nothing meaningful to show, so render nothing rather than "#undefined".
const label = computed(() => props.tag?.name || props.tag?.slug || '')

const to = computed(() => {
  const handle = props.tag?.slug || props.tag?.name
  return handle ? `/connect/hashtag/${encodeURIComponent(handle)}` : '/connect/hashtags'
})
</script>
