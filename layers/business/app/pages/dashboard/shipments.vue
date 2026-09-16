<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Shipments</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerShipments } from '~/composables/dashboard/useSellerShipments'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Shipments',
  meta: [
    {
      name: 'description',
      content: 'Track shipments for the orders you fulfil.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerShipments()
</script>
