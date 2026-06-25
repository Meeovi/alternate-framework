<script setup lang="ts">
const props = defineProps<{
  spaceId?: string
  max?: number
}>()

// Replace with real activity feed
const activity = [
  { id: '1', text: 'Sebastian created this Space', at: '2026-06-25T12:00:00Z' },
  { id: '2', text: 'New member joined', at: '2026-06-25T13:00:00Z' }
]
</script>

<template>
  <section class="spaces-activity">
    <h2 class="spaces-activity__title">Recent activity</h2>
    <ul class="spaces-activity__list">
      <li
        v-for="item in activity.slice(0, max || 5)"
        :key="item.id"
        class="spaces-activity__item"
      >
        <span class="spaces-activity__text">{{ item.text }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.spaces-activity__title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.spaces-activity__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.spaces-activity__item {
  padding: 0.25rem 0;
}
</style>
