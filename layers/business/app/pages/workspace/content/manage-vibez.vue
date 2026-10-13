<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>Manage Vibez</v-toolbar-title>
    </v-toolbar>
    <!-- The signed-in user's own vibes (Directus `shorts`; admins see all) —
         see meeoviTables.vibez in nuxt.config.ts. -->
    <div style="padding: 10px">
      <MeeoviTable collection="vibez" height="calc(100vh - 230px)" :hide="['video_url', 'thumbnail_url', 'dateTime']" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Manage Vibez' })
</script>
