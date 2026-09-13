<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Spaces</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller spaces page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Spaces',
  meta: [
    {
      name: 'description',
      content: 'This is the seller spaces page.'
    }
  ]
})
</script>
