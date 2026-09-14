<template>
  <div>
    <section data-bs-version="5.1" class="mbr-section features20 cid-txNnCwzel4" id="features20-4t"
      data-sortbtn="btn-primary">
      <div class="container-fluid">
        <h2 class="mbr-section-title align-left mbr-fonts-style display-5">
          Best Sellers</h2>
        <div class="underline align-left pb-3">
          <div class="line"></div>
        </div>
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" class="pa-4" show-arrows>
            <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
              v-for="(products, index) in bestsellers" :key="index">
              <ProductCard :product="products" :class="['ma-4', selectedClass]" @click="toggle" />

              <div class="d-flex fill-height align-center justify-center">
                <v-scale-transition>
                  <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                </v-scale-transition>
              </div>
            </v-slide-group-item>
          </v-slide-group>
        </v-sheet>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import ProductCard from './productCard.vue'

const model = ref(null)
const {
  $directus,
  $readItems
} = useNuxtApp()

// useProducts()/getCommerceClient() routes through initGateway()'s
// "commerce" domain, which nothing ever wires up (see
// packages/modules/alternate-sdk/index.ts) and CommerceDriverRegistry has
// zero registered implementations anywhere in the repo — every call
// silently resolved to null, so this section rendered nothing. Sibling
// components (latestproducts.vue, featuredproducts.vue) query Directus
// directly instead; do the same here rather than depend on a client that
// can never return data. There's no real sales/order-volume signal in
// Directus yet (salable_quantity is unset on every product), so this
// sorts by rating as the best available proxy for "best sellers" until
// real sales data exists.
const {
  data: bestsellers
} = await useAsyncData('bestsellers', async () => {
  try {
    return await $directus.request($readItems('products', {
      fields: ['*',
        'brands.brands_id.*',
        'image.*',
      ],
      filter: {
        status: {
          _eq: 'published'
        }
      },
      sort: '-rating',
      limit: 10,
    }))
  } catch {
    return null
  }
})
</script>