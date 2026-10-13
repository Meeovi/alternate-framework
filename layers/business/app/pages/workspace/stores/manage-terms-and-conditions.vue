<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>Terms and Conditions</v-toolbar-title>
    </v-toolbar>
    <!-- Rows from the installed commerce adapter or Directus (see meeoviTables
         in nuxt.config.ts); admins can add, edit and delete. -->
    <div style="padding: 10px">
      <MeeoviTable collection="terms" height="calc(100vh - 230px)" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Terms and Conditions' })
</script>
