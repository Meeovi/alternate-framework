<script setup lang="ts">
import { useLocate } from 'alternate-locate/adapters/vue/composable'
import { useHydratedHead } from '../../composables/core/vue'

definePageMeta({
  middleware: ['auth'],
})

const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.compose'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/compose" icon="i-ri:quill-pen-line">
        {{ $t('nav.compose') }}
      </MainTitle>
    </template>
    <PublishWidgetFull />
  </MainContent>
</template>
