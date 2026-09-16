<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Announcements</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <SellerDataGrid :columns="columns" :data="rows" :pending="pending" :error="error" />
    </div>
  </div>
</template>

<script setup>
import SellerDataGrid from '~/components/SellerDataGrid.vue'
import { useSellerAnnouncements } from '~/composables/dashboard/useSellerAnnouncements'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Announcements',
  meta: [
    {
      name: 'description',
      content: 'Messages and notices from the marketplace admin.'
    }
  ]
})

const { columns, rows, pending, error } = useSellerAnnouncements()
</script>
