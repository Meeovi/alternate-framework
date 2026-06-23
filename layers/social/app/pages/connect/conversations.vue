<template>
  <MainContent>
    <v-toolbar title="Conversations"></v-toolbar>
    <template #title>
      <MainTitle as="router-link" to="/conversations" icon="i-ri:at-line">
        {{ t('nav.conversations') }}
      </MainTitle>
    </template>

    <TimelineConversations v-if="isHydrated" />
  </MainContent>
</template>

<script setup lang="ts">
import { useHead } from 'nuxt/app'
import { computed } from 'vue'

const isHydrated = computed(() => import.meta.client)

const t = (key: string) => {
  const labels: Record<string, string> = {
    'nav.conversations': 'Conversations',
  }
  return labels[key] || key
}

useHead({
  title: 'Conversations',
})
</script>