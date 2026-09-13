<template>
  <div>
    <homeSettings />
  </div>
</template>

<script setup>
import homeSettings from '#auth/app/pages/settings/home.vue'

useHead({
  title: 'Meeovi Account'
})

definePageMeta({
  layout: 'settings'
})
</script>
