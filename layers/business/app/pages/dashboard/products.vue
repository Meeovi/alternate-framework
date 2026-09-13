<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Products</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller products page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Products',
  meta: [
    {
      name: 'description',
      content: 'This is the seller products page.'
    }
  ]
})
</script>
