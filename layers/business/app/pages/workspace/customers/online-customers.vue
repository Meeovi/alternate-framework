<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>Now Online</v-toolbar-title>
    </v-toolbar>
    <!-- Rows from the installed commerce adapter only (see meeoviTables in
         nuxt.config.ts); admins can add, edit and delete. -->
    <div style="padding: 10px">
      <MeeoviTable collection="online_customers" height="calc(100vh - 230px)" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Now Online' })
</script>
