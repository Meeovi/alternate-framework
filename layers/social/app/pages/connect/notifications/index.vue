<script setup lang="ts">
const isHydrated = computed(() => import.meta.client)

useHead({
  title: 'All | Notifications',
})
</script>

<template>
  <TimelineNotifications v-if="isHydrated" />
</template>
