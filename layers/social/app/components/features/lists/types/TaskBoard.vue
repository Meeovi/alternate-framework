<template>
  <Kanban :listId="listId" />
</template>

<script setup>
// ExperienceBuilder, previously rendered here, does not exist anywhere in
// this codebase (only an unrelated ExperienceBuilderCanvas.vue) — every
// list with list_type 'Board' hit an unresolved-component error. There's
// no spec for what ExperienceBuilder was meant to look like beyond the
// draggable/droppable/editable card config below, which is exactly what
// the real, already-working Kanban.vue (used for list_type 'Kanban')
// already provides — so 'Board' now renders the same real widget rather
// than staying broken.
import Kanban from './Kanban.vue'

defineProps({
  listId: { type: [String, Number], required: true },
  items: { type: Array, required: false, default: () => [] }
})
</script>
