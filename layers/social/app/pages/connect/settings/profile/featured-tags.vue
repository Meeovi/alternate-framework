<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { useHydratedHead } from '../../../../composables/core/vue'

const { t } = useLocate()

useHydratedHead({
  title: () => `${t('settings.profile.featured_tags.label')} | ${t('nav.settings')}`,
})
</script>

<template>
  <MainContent back>
    <template #title>
      <MainTitle as="h1" secondary icon="i-ri:test-tube-line">
        {{ $t('settings.profile.featured_tags.label') }}
      </MainTitle>
    </template>
    <div text-center mt-10>
      <h1 text-4xl>
        <span sr-only>{{ $t('settings.profile.featured_tags.under_construction') }}</span>
        🚧
      </h1>
      <h3 text-xl>
        {{ $t('settings.profile.featured_tags.label') }}
      </h3>
    </div>
  </MainContent>
</template>
