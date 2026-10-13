<script setup lang="ts">
defineProps<{ activeProducts?: number, totalProducts?: number, unfulfilled?: number }>()
</script>

<template>
  <v-card elevation="0" class="bg-primary overflow-hidden bubble-shape-sm bubble-primary mb-6" to="/workspace/catalog/products">
    <v-card-text class="pa-5">
      <div class="d-flex align-center ga-4">
        <v-btn color="darkprimary" icon rounded="sm" variant="flat" tabindex="-1">
          <v-icon icon="fas fa-boxes-stacked" size="18" />
        </v-btn>
        <div>
          <h4 class="text-h4 font-weight-medium">{{ activeProducts ?? 0 }} / {{ totalProducts ?? 0 }}</h4>
          <span class="text-subtitle-2 text-medium-emphasis text-white">Active Products</span>
        </div>
      </div>
    </v-card-text>
  </v-card>

  <v-card elevation="0" class="bubble-shape-sm overflow-hidden bubble-warning" to="/workspace/sales/orders">
    <v-card-text class="pa-5">
      <div class="d-flex align-center ga-4">
        <v-btn color="lightwarning" icon rounded="sm" variant="flat" tabindex="-1">
          <v-icon icon="fas fa-truck-fast" size="18" class="text-warning" />
        </v-btn>
        <div>
          <h4 class="text-h4 font-weight-medium">{{ unfulfilled ?? 0 }}</h4>
          <span class="text-subtitle-2 text-disabled font-weight-medium">Unfulfilled Orders</span>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>
