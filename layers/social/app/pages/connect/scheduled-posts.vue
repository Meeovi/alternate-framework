<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

function scrollToTop() {
  (useNuxtApp() as any).$scrollToTop?.()
}

useHydratedHead({
  title: () => t('nav.scheduled_posts'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <NuxtLink to="/scheduled-post" timeline-title-style flex items-center gap-2 @click="scrollToTop">
        <div i-ri:calendar-schedule-line />
        <span>{{ t('nav.scheduled_posts') }}</span>
      </NuxtLink>
    </template>

    <TimelineScheduledPosts v-if="isHydrated" />
  </MainContent>
</template>
