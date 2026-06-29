<template>
  <ExperienceBuilder
    :items="items"
    :config="builderConfig"
    @update="onUpdate"
  />
</template>

<script setup>
import { computed } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const props = defineProps({
  listId: { type: [String, Number], required: true },
  items: { type: Array, required: true }
})

const { reorderItems, moveItemToList, updateListItem } = useLists()

const builderConfig = computed(() => ({
  draggable: true,
  droppable: true,
  editable: true,
  fields: {
    title: { type: 'text', editable: true },
    notes: { type: 'textarea', editable: true },
    dueDate: { type: 'date', editable: true },
    priority: { type: 'select', items: ['low', 'medium', 'high'] }
  }
}))

const onUpdate = async ({ type, payload }) => {
  if (type === 'reorder') {
    await reorderItems(payload.items)
  }

  if (type === 'move') {
    await moveItemToList(payload.itemId, payload.newListId)
  }

  if (type === 'edit') {
    await updateListItem(payload.itemId, payload.changes)
  }

  emit('updated')
}
</script>
