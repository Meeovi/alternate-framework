<script setup lang="ts">
const props = defineProps<{
  spaceId?: string
  max?: number
  showAvatars?: boolean
}>()

// In production, replace with your real API/composable
const members = [
  { id: '1', name: 'Alice', avatar: null },
  { id: '2', name: 'Bob', avatar: null }
]
</script>

<template>
  <section class="spaces-members">
    <h2 class="spaces-members__title">Members</h2>
    <ul class="spaces-members__list">
      <li
        v-for="m in members.slice(0, max || 10)"
        :key="m.id"
        class="spaces-members__item"
      >
        <span
          v-if="showAvatars"
          class="spaces-members__avatar"
        >
          {{ m.name.charAt(0) }}
        </span>
        <span class="spaces-members__name">{{ m.name }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.spaces-members__title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}
.spaces-members__list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.spaces-members__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}
.spaces-members__avatar {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 999px;
  background: #e5e7eb;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}
</style>
