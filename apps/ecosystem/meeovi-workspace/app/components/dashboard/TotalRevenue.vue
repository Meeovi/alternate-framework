<script setup lang="ts">
import iconCard from '~/assets/images/icons/icon-card.svg'

defineProps<{ revenue?: number }>()

const links = [
  { title: 'Orders', icon: 'fas fa-receipt', to: '/dashboard/orders' },
  { title: 'Transactions', icon: 'fas fa-money-bill-transfer', to: '/dashboard/transactions' },
  { title: 'Payouts', icon: 'fas fa-building-columns', to: '/dashboard/payouts' },
  { title: 'Invoices', icon: 'fas fa-file-invoice-dollar', to: '/dashboard/invoices' }
]
</script>

<template>
  <v-card elevation="0" class="bg-secondary overflow-hidden bubble-shape bubble-secondary-shape">
    <v-card-text>
      <div class="d-flex align-start mb-6">
        <v-btn icon rounded="sm" color="darksecondary" variant="flat">
          <img :src="iconCard" width="25" alt="">
        </v-btn>
        <div class="ml-auto z-1">
          <v-menu>
            <template #activator="{ props }">
              <v-btn icon rounded="sm" color="secondary" variant="flat" size="small" v-bind="props" aria-label="Revenue links">
                <v-icon icon="fas fa-ellipsis" size="18" />
              </v-btn>
            </template>
            <v-sheet rounded="md" width="170" class="elevation-10">
              <v-list density="compact">
                <v-list-item v-for="item in links" :key="item.to" :to="item.to">
                  <template #prepend>
                    <v-icon :icon="item.icon" size="14" />
                  </template>
                  <v-list-item-title class="ml-2">{{ item.title }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-sheet>
          </v-menu>
        </div>
      </div>
      <h2 class="text-h1 font-weight-medium">
        {{ formatMoney(revenue) }}
        <NuxtLink to="/dashboard/transactions" aria-label="Transactions">
          <v-icon icon="fas fa-circle-arrow-up" size="24" class="text-white" style="transform: rotate(45deg)" />
        </NuxtLink>
      </h2>
      <span class="text-subtitle-1 text-medium-emphasis text-white">Total Revenue</span>
    </v-card-text>
  </v-card>
</template>
