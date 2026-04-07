<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.blocked_domains'),
})
</script>

<template>
  <MainContent back>
    <template #title>
      <MainTitle>{{ $t('nav.blocked_domains') }}</MainTitle>
    </template>

    <TimelineDomainBlocks v-if="isHydrated" />
  </MainContent>
</template>
