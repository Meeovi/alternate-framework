<template>
  <span v-if="total" class="fediverse-counts text-caption text-medium-emphasis" :title="title">
    <v-icon icon="fas fa-globe" size="x-small" class="mr-1" />
    <template v-if="counts.likes">{{ counts.likes }} ♥</template>
    <template v-if="counts.boosts"> · {{ counts.boosts }} boosts</template>
    <template v-if="counts.replies"> · {{ counts.replies }} replies</template>
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

/** Likes, boosts and replies an item got on the fediverse (shown when there are any). */
const props = defineProps<{ type: 'note' | 'product' | 'vibe', id: string | number }>()
const counts = ref({ likes: 0, boosts: 0, replies: 0 })
const total = computed(() => counts.value.likes + counts.value.boosts + counts.value.replies)
const title = computed(() => `On the fediverse: ${counts.value.likes} likes, ${counts.value.boosts} boosts, ${counts.value.replies} replies`)

onMounted(async () => {
  if (!/^\d+$/.test(String(props.id))) return
  counts.value = await $fetch<typeof counts.value>('/api/social/activitypub/counts', { query: { type: props.type, id: props.id } })
    .catch(() => counts.value)
})
</script>
