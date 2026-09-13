<template>
  <template v-if="available && rows.length">
    <v-list density="comfortable">
      <v-list-item
        v-for="(row, i) in rows"
        :key="keyOf(row, i)"
        :title="titleOf(row)"
        :subtitle="subtitleOf(row)"
        :prepend-icon="icon"
        :to="toOf(row)"
      />
    </v-list>
  </template>
  <div v-else class="text-medium-emphasis">{{ message }}</div>
</template>

<script setup>
import { computed } from 'vue'

/**
 * Renders a short list of profile entities (posts / spaces / hashtags /
 * events / shops / gift cards / subscriptions) or a muted fallback
 * message. The title / subtitle / key / link are resolved from
 * caller-supplied field lists and a link builder so every profile card
 * can share one list renderer.
 */
const props = defineProps({
  items: { type: Array, default: () => [] },
  available: { type: Boolean, default: false },
  message: { type: String, default: '' },
  icon: { type: String, default: '' },
  limit: { type: Number, default: 0 },
  // Ordered field names tried in turn for each piece of text.
  titleKeys: { type: Array, default: () => ['title', 'name'] },
  subtitleKeys: { type: Array, default: () => ['slug', 'date_created'] },
  keyKeys: { type: Array, default: () => ['id', 'slug', 'name'] },
  // (row) => RouteLocationRaw
  to: { type: Function, default: null },
  // Fallback label when no titleKey matches, e.g. `Post #`.
  titlePrefix: { type: String, default: '' },
})

const rows = computed(() => (props.limit > 0 ? props.items.slice(0, props.limit) : props.items))

const first = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key]
    if (value != null && value !== '') return value
  }
  return ''
}

const titleOf = (row) => {
  const value = first(row, props.titleKeys)
  if (value) return value
  return props.titlePrefix ? `${props.titlePrefix}${row?.id ?? ''}` : ''
}
const subtitleOf = (row) => first(row, props.subtitleKeys) || ''
const keyOf = (row, i) => first(row, props.keyKeys) || i
const toOf = (row) => (props.to ? props.to(row) : undefined)
</script>
