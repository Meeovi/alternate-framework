<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Seller Attributes</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerAttributes } from '~/composables/dashboard/useSellerAttributes'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Seller Attributes',
  meta: [
    {
      name: 'description',
      content: 'Manage the product attributes used across your catalog.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerAttributes()
</script>
