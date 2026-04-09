<script setup lang="ts">
  import {
    useLocate
  } from 'alternate-locate/adapters/vue/composable'
  import {
    currentUser
  } from '../../composables/contacts/users'
  import {
    isHydrated,
    useHydratedHead
  } from '../../composables/core/vue'

  const {
    t
  } = useLocate()

  useHead({
    title: 'Hashtags',
  })
</script>

<template>
  <MainContent>
    <v-toolbar title="Hashtags"></v-toolbar>
    <template #title>
      <MainTitle as="router-link" to="/hashtags" icon="i-ri:hashtag">
        {{ t('nav.hashtags') }}
      </MainTitle>
    </template>

    <NuxtPage v-if="isHydrated && currentUser" />
  </MainContent>
</template>