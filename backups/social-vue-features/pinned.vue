<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

useHead({
  title: 'Pinned Posts',
})
</script>

<template>
  <v-container fluid class="pa-0">
    <v-toolbar color="surface" border="b">
      <v-icon class="ml-3 mr-2">mdi-pin</v-icon>
      <NuxtLink to="/connect/pinned" class="text-decoration-none text-high-emphasis">
        <v-toolbar-title>Pinned Posts</v-toolbar-title>
      </NuxtLink>
    </v-toolbar>

    <ClientOnly>
      <TimelinePinned />
      <template #fallback>
        <v-container class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </v-container>
      </template>
    </ClientOnly>
  </v-container>
</template>
