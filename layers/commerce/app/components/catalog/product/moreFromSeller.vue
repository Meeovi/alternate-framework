<template>
  <!-- Under a product page's tabs (GET /api/commerce/products/more-from-seller):
       a video's "Other videos by this creator" (their Video products, then
       their vibez), or a product's "Other products by this seller". Hidden
       when there's nothing to show. -->
  <v-sheet v-if="products.length || vibez.length" class="mx-auto sliderProducts more-from-seller">
    <h4>
      {{ kind === 'videos' ? 'Other videos by' : 'Other products by' }}
      <NuxtLink v-if="seller?.username" :to="`/u/${encodeURIComponent(seller.username)}`">{{ seller.name }}</NuxtLink>
      <template v-else>{{ kind === 'videos' ? 'this creator' : 'this seller' }}</template>
    </h4>

    <v-slide-group v-if="products.length" v-model="productsModel" class="pa-4" show-arrows>
      <v-slide-group-item v-for="item in products" :key="`p-${item.id}`">
        <productCard :product="item" class="ma-4" />
      </v-slide-group-item>
    </v-slide-group>

    <template v-if="vibez.length">
      <h5 class="more-from-seller__sub">Vibez</h5>
      <v-slide-group v-model="vibezModel" class="pa-4" show-arrows>
        <v-slide-group-item v-for="item in vibez" :key="`v-${item.id}`">
          <short :short="item" class="ma-4" />
        </v-slide-group-item>
      </v-slide-group>
    </template>
  </v-sheet>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import productCard from './productCard.vue'
import short from '#social/app/components/related/short.vue'

const props = defineProps<{ productKey: string, kind: 'videos' | 'products' }>()

type Result = { seller: { username: string, name: string } | null, products: Record<string, any>[], vibez: Record<string, any>[] }

// Below the fold: fetched in the browser, so it never slows the page's server render.
const { data } = useLazyFetch<Result>('/api/commerce/products/more-from-seller', {
  query: computed(() => ({ key: props.productKey, kind: props.kind })),
  server: false,
  immediate: !!props.productKey,
  watch: [() => props.productKey, () => props.kind],
})
const seller = computed(() => data.value?.seller ?? null)
const products = computed(() => data.value?.products ?? [])
const vibez = computed(() => data.value?.vibez ?? [])
// Each slide group has its own model (see the product page's note on shared models).
const productsModel = ref(null)
const vibezModel = ref(null)
</script>

<style scoped>
.more-from-seller__sub {
  margin: 8px 0 0;
  padding: 0 16px;
  font-size: 1rem;
  font-weight: 700;
}
</style>
