<template>
  <div class="contentPage wishlistPage">
    <h1>Your Wishlist</h1>

    <div v-if="wishlistStore.itemCount === 0" class="empty">
      Nothing saved yet — tap the heart on any product to add it here.
    </div>

    <v-row v-else>
      <v-col cols="6" sm="4" md="3" v-for="product in products" :key="product.id">
        <productCard :product="product" />
      </v-col>
    </v-row>
  </div>
</template>

<script setup>
  import productCard from '../components/catalog/product/productCard.vue'
  import { useWishlistStore } from '../stores/wishlist/useWishlistStore'

  const wishlistStore = useWishlistStore()

  const {
    $directus,
    $readItems
  } = useNuxtApp()

  const { data: products } = await useAsyncData(
    'wishlist-products',
    () => {
      if (wishlistStore.items.length === 0) return Promise.resolve([])
      return $directus.request($readItems('products', {
        fields: ['*', 'image.*', 'shops.shops_id.*'],
        filter: { id: { _in: wishlistStore.items } }
      }))
    },
    { watch: [() => wishlistStore.items.length] }
  )

  useHead({
    title: 'Your Wishlist'
  })
</script>

<style scoped>
  .wishlistPage {
    padding: 24px 16px;
  }

  .empty {
    color: #666;
    padding: 40px 0;
    text-align: center;
  }
</style>
