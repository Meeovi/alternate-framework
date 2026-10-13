<script setup lang="ts">
import type { SellerOrder } from 'alternate-sdk/contracts'

defineProps<{ orders: SellerOrder[], outOfStock?: number }>()

const paymentColor = { paid: 'success', pending: 'warning', refunded: 'error' } as const
</script>

<template>
  <v-card elevation="0">
    <v-card variant="outlined">
      <v-card-text>
        <div class="d-flex align-center">
          <h4 class="text-h4 mt-1">Recent Orders</h4>
          <div class="ml-auto">
            <v-btn color="primary" size="small" icon rounded="sm" variant="text" to="/workspace/sales/orders" aria-label="All orders">
              <v-icon icon="fas fa-ellipsis" size="20" />
            </v-btn>
          </div>
        </div>

        <v-card class="bg-lightsecondary mt-5" to="/workspace/catalog/products">
          <div class="pa-5 d-flex align-start justify-space-between">
            <div>
              <h6 class="text-secondary text-h5">Out of stock</h6>
              <span class="text-subtitle-2 text-medium-emphasis font-weight-bold">Products needing restock</span>
            </div>
            <h4 class="text-h4">{{ outOfStock ?? 0 }}</h4>
          </div>
        </v-card>

        <div class="mt-4">
          <div class="ws-scroll" style="height: 270px">
            <v-list v-if="orders.length" lines="two" class="py-0">
              <v-list-item v-for="order in orders" :key="order.id" :value="order.id" color="secondary" rounded="sm" to="/workspace/sales/orders">
                <div class="d-inline-flex align-center justify-space-between w-100">
                  <div>
                    <h6 class="text-subtitle-1 text-medium-emphasis font-weight-bold">{{ order.customer }}</h6>
                    <span class="text-subtitle-2 text-medium-emphasis">
                      #{{ order.id }} · {{ order.items }} item{{ order.items === 1 ? '' : 's' }} · {{ new Date(order.placed).toLocaleDateString() }}
                    </span>
                  </div>
                  <div class="ml-auto text-right">
                    <div class="text-subtitle-1 text-medium-emphasis font-weight-bold">{{ formatMoney(order.total) }}</div>
                    <v-chip :color="paymentColor[order.paymentStatus] || 'secondary'" size="x-small" variant="tonal" class="text-capitalize">
                      {{ order.paymentStatus }}
                    </v-chip>
                  </div>
                </div>
              </v-list-item>
            </v-list>
            <p v-else class="text-subtitle-2 text-medium-emphasis text-center mt-10">No orders yet.</p>
          </div>

          <div class="text-center mt-3">
            <v-btn color="primary" variant="text" to="/workspace/sales/orders" append-icon="fas fa-chevron-right">View All</v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-card>
</template>
