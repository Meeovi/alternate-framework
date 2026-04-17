<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { useHydratedHead } from '../../../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()
const pwaEnabled = useAppConfig().pwaEnabled

useHydratedHead({
  title: () => `${t('settings.notifications.label')} | ${t('nav.settings')}`,
})
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.notifications.label') }}
      </MainTitle>
    </template>

    <SettingsItem
      command
      :text="$t('settings.notifications.notifications.label')"
      to="/settings/notifications/notifications"
    />
    <SettingsItem
      command
      :disabled="!pwaEnabled"
      :text="$t('settings.notifications.push_notifications.label')"
      :description="$t('settings.notifications.push_notifications.description')"
      to="/settings/notifications/push-notifications"
    />
  </MainContent>
</template>
