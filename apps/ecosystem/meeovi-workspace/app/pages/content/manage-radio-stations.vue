<template>
  <!-- The signed-in user's own stations (Directus `radios`; admins see all) —
       see meeoviTables.radio_stations in nuxt.config.ts. -->
  <MeeoviTable collection="radio_stations" height="calc(100vh - 230px)" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Manage Radio Stations' })
</script>
