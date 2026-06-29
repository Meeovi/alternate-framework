<template>
  <v-sheet class="pa-4">
    <v-toolbar flat>
      <v-toolbar-title>Meeovi Dates</v-toolbar-title>
    </v-toolbar>

    <v-calendar
      v-model="focus"
      :events="events"
      color="primary"
      type="month"
      @click:event="onEventClick"
    />
  </v-sheet>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const focus = ref(new Date().toISOString().substring(0, 10))
const events = ref([])

const { listToday, listUpcoming } = useLists()

onMounted(async () => {
  const today = await listToday(/* userId */)
  const upcoming = await listUpcoming(/* userId */)

  events.value = [
    ...today.map(t => ({
      name: t.title,
      start: t.dueDate,
      color: 'red'
    })),
    ...upcoming.map(t => ({
      name: t.title,
      start: t.dueDate,
      color: 'blue'
    }))
  ]
})

const emit = defineEmits(['event-click'])

const onEventClick = (event) => {
  emit('event-click', event)
}
</script>