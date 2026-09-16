<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Featured Products</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerFeaturedProducts } from '~/composables/dashboard/useSellerFeaturedProducts'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Featured Products',
  meta: [
    {
      name: 'description',
      content: 'Manage paid featured-placement slots for your products.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerFeaturedProducts()
</script>
