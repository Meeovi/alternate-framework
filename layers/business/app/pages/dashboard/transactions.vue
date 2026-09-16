<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Transactions</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerTransactions } from '~/composables/dashboard/useSellerTransactions'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Transactions',
  meta: [
    {
      name: 'description',
      content: 'Your per-order commission and net earnings breakdown.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerTransactions()
</script>
