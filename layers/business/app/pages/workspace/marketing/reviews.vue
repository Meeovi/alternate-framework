<template>
  <!-- Messages in the live discussions on sellers' product and outlet pages
       (Rocket.Chat) — see server/plugins/discussion-reviews.ts. Read-only. -->
  <MeeoviTable collection="reviews" height="calc(100vh - 230px)" />
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
useHead({ title: 'Reviews' })
</script>
