<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.conversations'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/conversations" icon="i-ri:at-line">
        {{ t('nav.conversations') }}
      </MainTitle>
    </template>

    <TimelineConversations v-if="isHydrated" />
  </MainContent>
</template>
