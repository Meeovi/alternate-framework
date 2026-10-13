<template>
  <div class="contentPage">
    <v-toolbar color="primary">
      <v-toolbar-title>Reviews</v-toolbar-title>
    </v-toolbar>
    <!-- Messages in the live discussions on sellers' product and outlet pages
         (Rocket.Chat) — see server/plugins/discussion-reviews.ts. Read-only. -->
    <div style="padding: 10px">
      <MeeoviTable collection="reviews" height="calc(100vh - 230px)" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Reviews' })
</script>
