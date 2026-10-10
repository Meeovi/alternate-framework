<script setup lang="ts">
import TotalRevenue from '~/components/dashboard/TotalRevenue.vue';
import TotalOrders from '~/components/dashboard/TotalOrders.vue';
import ShopSummary from '~/components/dashboard/ShopSummary.vue';
import RevenueChart from '~/components/dashboard/RevenueChart.vue';
import RecentOrders from '~/components/dashboard/RecentOrders.vue';

definePageMeta({ middleware: 'auth' });
useHead({ title: 'Dashboard' });

const { stats, pending, error, notSeller, refresh, years, months, ordersSince, monthlyOrderCounts, revenueByMonth } = useWorkspaceDashboard();
</script>

<template>
  <v-alert v-if="notSeller" type="info" variant="tonal" class="mb-6" title="Seller account required">
    The workspace dashboard shows your shop's sales. Register as a seller to start selling on Meeovi.
  </v-alert>

  <v-alert v-else-if="error" type="error" variant="tonal" class="mb-6" title="Couldn't load your dashboard">
    {{ error.statusMessage || error.message }}
    <template #append>
      <v-btn variant="text" @click="refresh()">Retry</v-btn>
    </template>
  </v-alert>

  <div v-else-if="pending && !stats" class="d-flex justify-center py-16">
    <v-progress-circular indeterminate color="secondary" />
  </div>

  <v-row v-else>
    <v-col cols="12" md="4">
      <TotalRevenue :revenue="stats?.orders.totalRevenue" />
    </v-col>
    <v-col cols="12" md="4">
      <TotalOrders :month="ordersSince(30).length" :year="ordersSince(365).length" :trend="monthlyOrderCounts(8)" />
    </v-col>
    <v-col cols="12" md="4">
      <ShopSummary
        :active-products="stats?.products.active"
        :total-products="stats?.products.total"
        :unfulfilled="stats?.orders.unfulfilled"
      />
    </v-col>

    <v-col cols="12" lg="8">
      <RevenueChart :years="years" :months="months" :revenue-by-month="revenueByMonth" />
    </v-col>
    <v-col cols="12" lg="4">
      <RecentOrders :orders="stats?.recentOrders ?? []" :out-of-stock="stats?.products.outOfStock" />
    </v-col>
  </v-row>
</template>
