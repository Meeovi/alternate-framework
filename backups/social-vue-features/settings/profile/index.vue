<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { currentUser } from '../../../../composables/contacts/users'
import { isHydrated, useHydratedHead } from '../../../../composables/core/vue'

const { t } = useLocate()

useHydratedHead({
  title: () => `${t('settings.profile.label')} | ${t('nav.settings')}`,
})
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.profile.label') }}
      </MainTitle>
    </template>

    <SettingsItem
      command large
      icon="i-ri:user-settings-line"
      :text="$t('settings.profile.appearance.label')"
      :description="$t('settings.profile.appearance.description')"
      to="/settings/profile/appearance"
    />
    <SettingsItem
      command large
      icon="i-ri:hashtag"
      :text="$t('settings.profile.featured_tags.label')"
      :description="$t('settings.profile.featured_tags.description')"
      to="/settings/profile/featured-tags"
    />
    <SettingsItem
      v-if="isHydrated && currentUser"
      command large
      icon="i-ri:settings-line"
      :text="$t('settings.account_settings.label')"
      :description="$t('settings.account_settings.description')"
      :to="`https://${currentUser!.server}/auth/edit`"
      external target="_blank"
    />
  </MainContent>
</template>
