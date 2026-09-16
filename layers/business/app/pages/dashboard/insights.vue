<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div>
    <v-toolbar color="white">
      <v-toolbar-title>Business Insights</v-toolbar-title>
    </v-toolbar>

    <div class="contentSection">
      <v-alert v-if="error" type="error" variant="tonal" density="compact" class="mb-4">
        Couldn't load insights. {{ (error as any)?.statusMessage || (error as any)?.message || '' }}
      </v-alert>

      <div v-if="pending" class="insights-loading">
        <v-progress-circular indeterminate color="primary" size="32" />
      </div>

      <v-row v-else>
        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Orders Insights</v-card-title>
            <v-card-text>
              <p>Total orders: <strong>{{ stats?.orders.total ?? 0 }}</strong></p>
              <p>Awaiting fulfillment: <strong>{{ stats?.orders.unfulfilled ?? 0 }}</strong></p>
              <p>Revenue: <strong>${{ (stats?.orders.totalRevenue ?? 0).toFixed(2) }}</strong></p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Products Insights</v-card-title>
            <v-card-text>
              <p>Total products: <strong>{{ stats?.products.total ?? 0 }}</strong></p>
              <p>Active: <strong>{{ stats?.products.active ?? 0 }}</strong></p>
              <p>Out of stock: <strong>{{ stats?.products.outOfStock ?? 0 }}</strong></p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="4">
          <v-card>
            <v-card-title>Reviews Insights</v-card-title>
            <v-card-text>
              <p>Total reviews: <strong>{{ stats?.reviews.total ?? 0 }}</strong></p>
              <p>Average rating: <strong>{{ (stats?.reviews.averageRating ?? 0).toFixed(1) }} / 5</strong></p>
              <p>Pending moderation: <strong>{{ stats?.reviews.pending ?? 0 }}</strong></p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Recent Sales</v-card-title>
            <v-card-text>
              <v-table v-if="stats?.recentOrders?.length" density="compact">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Placed</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="order in stats.recentOrders" :key="order.id">
                    <td>{{ order.id }}</td>
                    <td>{{ order.customer }}</td>
                    <td>${{ order.total.toFixed(2) }}</td>
                    <td>{{ new Date(order.placed).toLocaleDateString() }}</td>
                  </tr>
                </tbody>
              </v-table>
              <p v-else>No orders yet.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Spaces Statistics</v-card-title>
            <v-card-text>
              <p>Total spaces: <strong>{{ stats?.spaces.total ?? 0 }}</strong></p>
              <p>Total members: <strong>{{ stats?.spaces.totalMembers ?? 0 }}</strong></p>
              <p>Total posts: <strong>{{ stats?.spaces.totalPosts ?? 0 }}</strong></p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Recent Emails</v-card-title>
            <v-card-text>
              <p>No email backend is wired up for this dashboard yet.</p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card>
            <v-card-title>Shipment Details</v-card-title>
            <v-card-text>
              <p>In transit: <strong>{{ stats?.shipments.inTransit ?? 0 }}</strong></p>
              <p>Delivered: <strong>{{ stats?.shipments.delivered ?? 0 }}</strong></p>
              <p>Exceptions: <strong>{{ stats?.shipments.exceptions ?? 0 }}</strong></p>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12">
          <v-card>
            <v-card-title>Latest Meeovi Business news</v-card-title>
            <v-card-text>
              <p>No news feed is wired up for this dashboard yet.</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useBusinessDriver } from '~/composables/useBusinessDriver'

definePageMeta({ middleware: 'seller' })
useHead({
  title: 'Business Insights',
  meta: [
    {
      name: 'description',
      content: 'A live overview of your orders, products, reviews, spaces and shipments.'
    }
  ]
})

const business = useBusinessDriver()
const { data: stats, pending, error } = useAsyncData(
  'seller-business-stats',
  () => business.getStats()
)
</script>

<style scoped>
.insights-loading {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
