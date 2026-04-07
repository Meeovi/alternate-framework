<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { useHydratedHead } from '../../../../composables/core/vue'

definePageMeta({
  middleware: ['auth', () => {
    if (!useAppConfig().pwaEnabled)
      return navigateTo('/settings/notifications')
  }],
})

const { t } = useLocate()

useHydratedHead({
  title: () => `${t('settings.notifications.push_notifications.label')} | ${t('settings.notifications.label')} | ${t('nav.settings')}`,
})
</script>

<template>
  <MainContent back>
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.notifications.push_notifications.label') }}
      </MainTitle>
    </template>
    <NotificationPreferences show />
  </MainContent>
</template>
