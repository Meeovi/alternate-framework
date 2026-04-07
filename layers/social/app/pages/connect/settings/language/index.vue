<script setup lang="ts">
import type { ElkTranslationStatus } from '../../../../../../shared/shared/types/translation-status'
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { currentUser } from '../../../../composables/contacts/users'
import { useHydratedHead } from '../../../../composables/core/vue'

const { t, locale } = useLocate()

const { data: translationStatus } = await useAsyncData('social-translation-status', () => {
  return $fetch<ElkTranslationStatus>('/mframework-translation-status.json')
    .catch(() => ({ total: 0, locales: {} }))
})

useHydratedHead({
  title: () => `${t('settings.language.label')} | ${t('nav.settings')}`,
})
const status = computed(() => {
  const value = translationStatus.value ?? { total: 0, locales: {} }
  const entry = value.locales[locale.value] ?? { total: 0, percentage: '0%' }
  return t('settings.language.status', [entry.total, value.total, entry.percentage])
})
</script>

<template>
  <MainContent back="small-only">
    <template #title>
      <MainTitle as="h1" secondary>
        {{ $t('settings.language.label') }}
      </MainTitle>
    </template>
    <div p6>
      <section space-y-2>
        <h2 py2 font-bold text-xl flex="~ gap-1" items-center>
          {{ $t('settings.language.display_language') }}
        </h2>
        <div>
          {{ status }}
        </div>
        <SettingsLanguage select-settings />
        <NuxtLink
          href="https://docs.mframework.zone/guide/contributing"
          target="_blank"
          hover:underline text-primary inline-flex items-center gap-1
        >
          <span inline-block i-ri:information-line />
          {{ $t('settings.language.how_to_contribute') }}
        </NuxtLink>
      </section>
      <section mt4>
        <h2 font-bold text-xl flex="~ gap-1" items-center>
          {{ $t('settings.language.post_language') }}
        </h2>
        <SettingsItem
          v-if="currentUser"
          command large
          icon="i-ri:quill-pen-line"
          :text="$t('settings.language.post_language')"
          :description="$t('settings.account_settings.description')"
          :to="`https://${currentUser!.server}/settings/preferences/other`"
          external target="_blank"
        />
      </section>
      <section>
        <h2 py4 mt2 font-bold text-xl flex="~ gap-1" items-center>
          {{ $t('settings.language.translations.heading') }}
        </h2>
        <SettingsTranslations />
      </section>
    </div>
  </MainContent>
</template>
