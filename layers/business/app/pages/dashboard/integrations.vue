<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Integrations</v-toolbar-title>

      <v-toolbar-items>
        <v-btn title="Add a integration" href="/departments/appstore" text="Add a integration" variant="text"></v-btn>
      </v-toolbar-items>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerIntegrations } from '~/composables/dashboard/useSellerIntegrations'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Integrations',
  meta: [
    {
      name: 'description',
      content: 'Manage the apps and services connected to your seller account.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerIntegrations()
</script>
