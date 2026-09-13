<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Orders</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection"></div>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Orders',
  meta: [
    {
      name: 'description',
      content: 'This is the seller products page.'
    }
  ]
})
</script>
