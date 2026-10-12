<template>
  <!-- Not wired to a data source yet. -->
  <div>
    <v-toolbar color="primary">
      <v-toolbar-title>News</v-toolbar-title>
    </v-toolbar>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'News' })
</script>
