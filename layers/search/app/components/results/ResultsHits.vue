<template>
  <ais-hits>
    <template #default="{ items }">
      <v-list
        v-if="items.length"
        lines="two"
        bg-color="transparent"
        class="amz-list pa-0"
      >
        <v-list-item
          v-for="item in items"
          :key="String(item.objectID || item._id || item.id || item.title)"
          class="amz-card"
        >
          <template #prepend>
            <div class="amz-card__media">
              <div class="amz-media-placeholder">
                {{ getTitle(item).charAt(0) }}
              </div>
            </div>
          </template>

          <v-list-item-title class="amz-card__title">
            {{ getTitle(item) }}
          </v-list-item-title>

          <v-list-item-subtitle class="amz-card__subtitle">
            <span class="amz-card__index">{{ activeIndex }}</span>
            <span v-if="item.brand">{{ item.brand }}</span>
            <span v-if="item.category">{{ item.category }}</span>
          </v-list-item-subtitle>

          <p class="amz-card__desc">{{ getDescription(item) }}</p>

          <div class="amz-card__actions">
            <strong v-if="getPrice(item) !== null" class="amz-price">
              {{ formatPrice(getPrice(item)) }}
            </strong>

            <v-btn
              v-if="getLink(item)"
              :href="String(getLink(item))"
              target="_blank"
              rel="noreferrer"
              color="primary"
              variant="text"
              class="px-0"
            >
              View details
            </v-btn>
          </div>
        </v-list-item>
      </v-list>

      <v-alert v-else type="warning" variant="tonal" class="mb-4">
        <strong>No matches</strong>
        <div>{{ emptyMessage }}</div>
      </v-alert>
    </template>
  </ais-hits>
</template>

<script setup lang="ts">
defineProps<{
  emptyMessage: string
  activeIndex: string
  getTitle: (item: any) => string
  getDescription: (item: any) => string
  getPrice: (item: any) => number | null
  getLink: (item: any) => string | null
  formatPrice: (value: number | null) => string
}>()
</script>
