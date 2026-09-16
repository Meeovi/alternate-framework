<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Low Stock</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerLowStock } from '~/composables/dashboard/useSellerLowStock'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Low Stock',
  meta: [
    {
      name: 'description',
      content: 'Products running low so you can restock before they sell out.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerLowStock()
</script>
