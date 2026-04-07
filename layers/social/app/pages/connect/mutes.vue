<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.muted_users'),
})
</script>

<template>
  <MainContent back>
    <template #title>
      <MainTitle>{{ $t('nav.muted_users') }}</MainTitle>
    </template>

    <TimelineMutes v-if="isHydrated" />
  </MainContent>
</template>
