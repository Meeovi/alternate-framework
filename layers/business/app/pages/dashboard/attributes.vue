<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Attributes</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller attributes page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Attributes',
  meta: [
    {
      name: 'description',
      content: 'This is the seller attributes page.'
    }
  ]
})
</script>
