<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.bookmarks'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/bookmarks" icon="i-ri:bookmark-line">
        {{ t('nav.bookmarks') }}
      </MainTitle>
    </template>

    <TimelineBookmarks v-if="isHydrated" />
  </MainContent>
</template>
