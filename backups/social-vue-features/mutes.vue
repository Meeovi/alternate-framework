<script setup lang="ts">
definePageMeta({
  middleware: ['auth'],
})

useHead({
  title: 'Muted Users',
})
</script>

<template>
  <v-container fluid class="pa-0">
    <v-toolbar color="surface" border="b">
      <v-icon class="ml-3 mr-2">mdi-volume-off</v-icon>
      <v-toolbar-title>Muted Users</v-toolbar-title>
    </v-toolbar>

    <ClientOnly>
      <TimelineMutes />
      <template #fallback>
        <v-container class="d-flex justify-center pa-8">
          <v-progress-circular indeterminate color="primary" />
        </v-container>
      </template>
    </ClientOnly>
  </v-container>
</template>
