<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Reviews</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerReviews } from '~/composables/dashboard/useSellerReviews'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Reviews',
  meta: [
    {
      name: 'description',
      content: 'Moderate and respond to reviews on your products.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerReviews()
</script>
