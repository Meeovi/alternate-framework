<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { isHydrated, useHydratedHead } from '../../composables/core/vue'
import { usePreferences } from '../../composables/settings/storage'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()
const useStarFavoriteIcon = usePreferences('useStarFavoriteIcon')

useHydratedHead({
  title: () => t('nav.favourites'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle
        as="router-link" to="/favourites"
        :icon="useStarFavoriteIcon ? 'i-ri:star-line' : 'i-ri:heart-3-line'"
      >
        {{ t('nav.favourites') }}
      </MainTitle>
    </template>

    <TimelineFavourites v-if="isHydrated" />
  </MainContent>
</template>
