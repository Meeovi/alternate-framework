<template>
  <v-container fluid>
    <v-row>
      <v-col
        v-for="day in week"
        :key="day.date"
        cols="12" md="3"
      >
        <v-card>
          <v-card-title>{{ day.label }}</v-card-title>
          <v-list>
            <v-list-item
              v-for="item in day.items"
              :key="item.id"
            >
              <v-checkbox v-model="item.completed" />
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLists } from '@/layers/social/composables/useLists'

const items = ref<any[]>([])
const { listUpcoming } = useLists()
const userId = /* user id */ 1

onMounted(async () => {
  items.value = await listUpcoming(userId)
})

const week = computed(() => {
  const days: { date: string; label: string; items: any[] }[] = []
  const base = new Date()
  for (let i = 0; i < 7; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const date = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })
    days.push({
      date,
      label,
      items: items.value.filter(i => i.dueDate === date)
    })
  }
  return days
})
</script>
