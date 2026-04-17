<template>
  <v-slide-group
    class="items-center pb-4"
    :class="wrapperClass"
    show-arrows
    data-testid="product-slider"
  >
    <v-slide-group-item
      v-for="product in items"
      :key="product.id"
    >
      <ProductCard
        class="max-w-[192px] mr-4"
        :name="product.name ?? ''"
        :slug="product.slug"
        :image-url="product.primaryImage?.url ?? ''"
        :image-alt="product.primaryImage?.alt ?? ''"
        :price="product.price?.value.amount"
        :rating-count="product.rating?.count"
        :rating="product.rating?.average"
      />
    </v-slide-group-item>
  </v-slide-group>
</template>

<script setup lang="ts">
import type { ProductSliderProps } from './types';

defineProps<ProductSliderProps>();
</script>
