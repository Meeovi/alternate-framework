<template>
  <v-sheet class="pa-4">
    <v-toolbar flat>
      <v-toolbar-title>Habits</v-toolbar-title>
    </v-toolbar>

    <v-list>
      <v-list-item
        v-for="habit in habits"
        :key="habit.id"
      >
        <v-list-item-title>{{ habit.title }}</v-list-item-title>
        <v-chip>{{ habit.streak || 0 }} days</v-chip>
        <v-btn
          size="small"
          color="primary"
          @click="markDone(habit)"
        >
          Done today
        </v-btn>
      </v-list-item>
    </v-list>
  </v-sheet>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useListItemsClient } from '../composables/useListItemsClient'

const props = defineProps<{
  listId: string | number
  items?: unknown[]
}>()

const COLLECTION = (useRuntimeConfig().public.listTypeHabitTracker as any)?.collection || 'list_items'
const { readItems, updateItem } = useListItemsClient()
const habits = ref<any[]>([])

// Previously loaded every 'habit' list the user owned (ignoring listId)
// and filtered items on `listId`, which isn't a list_items column — the
// real relation is `list_id`, as in the task list / kanban views.
// NOTE: list_items has no `streak` column yet (checked 2026-09-25) — read
// `*` rather than naming it (Directus rejects unknown fields in `fields`),
// and streaks won't persist until that integer column is added.
onMounted(async () => {
  habits.value = await readItems(COLLECTION, {
    fields: ['*'],
    filter: { list_id: { _eq: props.listId } },
    sort: ['position'],
  }) || []
})

const markDone = async (habit: any) => {
  const streak = (habit.streak || 0) + 1
  await updateItem(COLLECTION, habit.id, { streak })
  habit.streak = streak
}
</script>
