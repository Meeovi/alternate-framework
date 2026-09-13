<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Shipments</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller shipments page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Shipments',
  meta: [
    {
      name: 'description',
      content: 'This is the seller shipments page.'
    }
  ]
})
</script>
