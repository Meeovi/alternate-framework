<script setup lang="ts">
import type { mastodon } from 'masto'
import { isNotification } from '../../../composables/notifications/notification'

const route = useRoute()
const isHydrated = computed(() => import.meta.client)

const t = (key: string) => {
  const labels: Record<string, string> = {
    'nav.notifications': 'Notifications',
  }
  if (labels[key]) return labels[key]
  if (key.startsWith('tab.notifications_')) {
    return key.replace('tab.notifications_', '').replaceAll('_', ' ')
  }
  return key
}

const filter = computed<mastodon.v1.NotificationType | undefined>(() => {
  if (!isHydrated.value) return undefined

  const rawFilter = route.params?.filter
  const actualFilter = Array.isArray(rawFilter) ? rawFilter[0] : rawFilter
  if (typeof actualFilter === 'string' && isNotification(actualFilter)) return actualFilter

  return undefined
})

useHead({
  title: () => `${t(`tab.notifications_${filter.value ?? 'all'}`)} | ${t('nav.notifications')}`,
})
</script>

<template>
  <TimelineNotifications v-if="isHydrated" :filter="filter" />
</template>
