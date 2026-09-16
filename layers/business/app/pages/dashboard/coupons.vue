<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Coupons</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerCoupons } from '~/composables/dashboard/useSellerCoupons'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Coupons',
  meta: [
    {
      name: 'description',
      content: 'Manage promo codes scoped to your shop.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerCoupons()
</script>
