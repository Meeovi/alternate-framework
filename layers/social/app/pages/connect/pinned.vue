<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { currentUser } from '../../composables/contacts/users'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('account.pinned'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/pinned" icon="i-ri:pushpin-line">
        {{ t('account.pinned') }}
      </MainTitle>
    </template>

    <TimelinePinned v-if="isHydrated && currentUser" />
  </MainContent>
</template>
