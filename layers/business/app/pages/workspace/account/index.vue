<template>
  <div>
    <homeSettings />
  </div>
</template>

<script setup>
import homeSettings from '../settings/home.vue'

useHead({
  title: 'Meeovi Account'
})

definePageMeta({
  layout: 'settings'
})
</script>
