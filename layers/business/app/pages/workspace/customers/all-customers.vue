<template>
  <!-- Rows from the installed commerce adapter only (see meeoviTables in
       nuxt.config.ts); admins can add, edit and delete. -->
  <MeeoviTable collection="customers" height="calc(100vh - 230px)" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Customers' })
</script>
