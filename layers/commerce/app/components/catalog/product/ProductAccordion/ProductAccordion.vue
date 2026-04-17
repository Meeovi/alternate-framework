<template>
  <div data-testid="product-accordion">
    <v-expansion-panels v-model="openPanels" multiple>
      <v-expansion-panel>
        <v-expansion-panel-title class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3">
          <h2 class="font-bold font-headings text-lg leading-6 md:text-2xl">
            {{ $t('productDetails') }}
          </h2>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <p>{{ product.description }}</p>
        </v-expansion-panel-text>
      </v-expansion-panel>
      <v-expansion-panel>
        <v-expansion-panel-title class="md:rounded-md w-full hover:bg-neutral-100 py-2 pl-4 pr-3">
          <h2 class="font-bold font-headings text-lg leading-6 md:text-2xl">
            {{ $t('customerReviews') }}
          </h2>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <Review v-for="review in productReviews" :key="review.id" :review="review" class="mb-4" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>



<script setup lang="ts">

import { useProductReviews } from '~/composables/catalog/useProductReviews';
import type { ProductAccordionPropsType } from './types';
import { toRefs, ref } from '#imports';

const props = defineProps<ProductAccordionPropsType>();

const { product } = toRefs(props);
const { data: productReviews, fetchProductReviews } = useProductReviews(product.value.slug);

const openPanels = ref([0]);

fetchProductReviews(product.value.slug);
</script>
