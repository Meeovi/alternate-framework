<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Invoices</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerInvoices } from '~/composables/dashboard/useSellerInvoices'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Invoices',
  meta: [
    {
      name: 'description',
      content: 'Track and manage your seller invoices.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerInvoices()
</script>
