<template>
  <div>
    <v-row>
      <v-col cols="3" v-if="space?.products?.length" v-for="products in space?.products" :key="products.id">
        <SpaceProducts :product="products?.products_id" />
      </v-col>
      <div class="center-text" v-else>No Products yet</div>
    </v-row>
  </div>
</template>
<script setup>
defineProps({ space: Object })
import SpaceProducts from '../../../../../commerce/app/components/catalog/product/productCard.vue'
</script>
