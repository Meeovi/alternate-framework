<script setup lang="ts">
const { t } = useLocate()

useHydratedHead({
  title: () => t('nav.lists'),
})
</script>

<template>
  <MainContent>
    <template #title>
      <MainTitle as="router-link" to="/lists" icon="i-ri:list-check">
        {{ t('nav.lists') }}
      </MainTitle>
    </template>
    <NuxtPage v-if="isHydrated" />
  </MainContent>
</template>
