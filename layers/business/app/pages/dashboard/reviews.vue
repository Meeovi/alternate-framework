<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Reviews</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller reviews page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Reviews',
  meta: [
    {
      name: 'description',
      content: 'This is the seller reviews page.'
    }
  ]
})
</script>
