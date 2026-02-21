<template>
  <p data-testid="recommended-products" class="my-4 typography-text-lg">
    {{ $t('recommendedProducts') }}
  </p>
  <ProductSlider :items="products" />
</template>


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

import { RecommendedProductsProps } from './types';

defineProps<RecommendedProductsProps>();
</script>
