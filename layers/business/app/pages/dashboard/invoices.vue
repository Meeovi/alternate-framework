<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Invoices</v-toolbar-title>
    </v-toolbar>

    <p>This is the seller invoices page.</p>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Invoices',
  meta: [
    {
      name: 'description',
      content: 'This is the seller invoices page.'
    }
  ]
})
</script>
