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
import { useLists } from '../../../composables/lists/useLists'

const habits = ref<any[]>([])
const { listLists, updateListItem } = useLists()

onMounted(async () => {
  const lists = await listLists({ filter: { type: { _eq: 'habit' } } })
  const habitListIds = lists.map(l => l.id)
  const { $sdk } = useNuxtApp() as any
  habits.value = await $sdk.content.readItems('list_items', {
    filter: { listId: { _in: habitListIds } }
  }) || []
})

const markDone = async (habit: any) => {
  const streak = (habit.streak || 0) + 1
  await updateListItem(habit.id, { streak })
  habit.streak = streak
}
</script>
