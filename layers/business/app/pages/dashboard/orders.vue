<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Orders</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerOrders } from '~/composables/dashboard/useSellerOrders'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Orders',
  meta: [
    {
      name: 'description',
      content: 'View and manage orders containing your products.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerOrders()
</script>
