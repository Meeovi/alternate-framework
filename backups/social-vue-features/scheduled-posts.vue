<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

useHead({
  title: 'Scheduled Posts',
})

function scrollToTop() {
  (useNuxtApp() as any).$scrollToTop?.()
}
</script>

<template>
  <v-container fluid class="pa-0">
    <v-toolbar color="surface" border="b">
      <NuxtLink
        to="/connect/scheduled-posts"
        class="text-decoration-none text-high-emphasis d-flex align-center"
        @click="scrollToTop"
      >
        <v-icon class="ml-3 mr-2">mdi-calendar-clock-outline</v-icon>
        <v-toolbar-title>Scheduled Posts</v-toolbar-title>
      </NuxtLink>
    </v-toolbar>

    <ClientOnly>
      <TimelineScheduledPosts />
      <template #fallback>
        <v-container class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </v-container>
      </template>
    </ClientOnly>
  </v-container>
</template>
