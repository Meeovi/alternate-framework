<script setup lang="ts">
import { definePageMeta, useHead } from '~/composables/core/vue'
import { useLocate } from 'alternate-gateway/locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '~/composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

  useHead({
    title: 'Conversations',
  })
</script>

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
