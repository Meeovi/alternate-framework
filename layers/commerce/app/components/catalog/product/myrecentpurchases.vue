<template>
  <div v-if="products.length">
    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 class="mbr-section-title align-left mbr-fonts-style display-5">{{ title }}</h2>
        <div class="underline align-left pb-3">
          <div class="line"></div>
        </div>
        <v-sheet class="mx-auto">
          <v-slide-group class="pa-4" show-arrows>
            <v-slide-group-item v-for="product in products" :key="product.id">
              <productCard :product="product" class="ma-4" />
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>
    </section>
  </div>
</template>

<script setup>
  // The signed-in user's own recent purchases, to buy again
  // (server/api/commerce/purchases/mine.get.ts: every order source, paid
  // orders only). Renders nothing for guests or before a first purchase.
  import { computed } from 'vue'
  import productCard from './productCard.vue'
  import { reuseServerData } from '#shared/app/utils/reuseServerData'

  const { title, limit } = defineProps({
    title: { type: String, default: 'Your Recent Purchases' },
    limit: { type: Number, default: 12 },
  })

  // useRequestFetch forwards the session cookie when this renders on the server.
  const request = useRequestFetch()
  const { data } = useAsyncData(`my-recent-purchases-${limit}`,
    () => request('/api/commerce/purchases/mine', { query: { limit } }).catch(() => null),
    { getCachedData: reuseServerData, lazy: true })

  const products = computed(() => data.value?.products ?? [])
</script>
