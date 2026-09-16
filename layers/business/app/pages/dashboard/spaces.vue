<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Spaces</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerSpaces } from '~/composables/dashboard/useSellerSpaces'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Spaces',
  meta: [
    {
      name: 'description',
      content: 'Manage the community spaces you run.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerSpaces()
</script>
