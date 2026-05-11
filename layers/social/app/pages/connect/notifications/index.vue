<script setup lang="ts">
import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '~/composables/core/vue'

const { t } = useLocate()

useHydratedHead({
  title: () => `${t('tab.notifications_all')} | ${t('nav.notifications')}`,
})
</script>

<template>
  <TimelineNotifications v-if="isHydrated" />
</template>
