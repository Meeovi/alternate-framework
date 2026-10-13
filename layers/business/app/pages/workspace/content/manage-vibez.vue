<template>
  <!-- The signed-in user's own vibes (Directus `shorts`; admins see all) —
       see meeoviTables.vibez in nuxt.config.ts. -->
  <MeeoviTable collection="vibez" height="calc(100vh - 230px)" :hide="['video_url', 'thumbnail_url', 'dateTime']" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Manage Vibez' })
</script>
