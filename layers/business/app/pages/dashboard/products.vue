<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Products</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerProducts } from '~/composables/dashboard/useSellerProducts'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Products',
  meta: [
    {
      name: 'description',
      content: 'Manage the products you sell on Meeovi.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerProducts()
</script>
