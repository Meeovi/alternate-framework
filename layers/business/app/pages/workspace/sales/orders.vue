<template>
  <!-- Rows from the installed commerce adapter or Directus (see meeoviTables
       in nuxt.config.ts); admins can add, edit and delete. -->
  <MeeoviTable collection="orders" height="calc(100vh - 230px)" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Orders' })
</script>
