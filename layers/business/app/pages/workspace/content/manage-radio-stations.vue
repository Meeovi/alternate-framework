<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>Manage Radio Stations</v-toolbar-title>
    </v-toolbar>
    <!-- The signed-in user's own stations (Directus `radios`; admins see all) —
         see meeoviTables.radio_stations in nuxt.config.ts. -->
    <div style="padding: 10px">
      <MeeoviTable collection="radio_stations" height="calc(100vh - 230px)" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Manage Radio Stations' })
</script>
