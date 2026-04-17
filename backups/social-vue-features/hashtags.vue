<script setup lang="ts">
useHead({
  title: 'Hashtags',
})
</script>

<template>
  <v-container fluid class="pa-0">
    <v-toolbar color="surface" border="b">
      <v-icon class="ml-3 mr-2">mdi-pound</v-icon>
      <NuxtLink to="/connect/hashtags" class="text-decoration-none text-high-emphasis">
        <v-toolbar-title>Hashtags</v-toolbar-title>
      </NuxtLink>
    </v-toolbar>

    <ClientOnly>
      <FeaturesHashtags />
      <template #fallback>
        <v-container class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </v-container>
      </template>
    </ClientOnly>
  </v-container>
</template>