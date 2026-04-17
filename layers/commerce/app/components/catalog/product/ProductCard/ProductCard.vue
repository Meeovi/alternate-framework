<template>
  <div class="border border-neutral-200 rounded-md hover:shadow-lg flex-auto flex-shrink-0" data-testid="product-card">
    <div class="relative">
      <NuxtLink :to="`${paths.product}${slug}`">
        <NuxtImg
          :src="imageUrl"
          :alt="imageAlt"
          class="object-cover rounded-md aspect-square w-full h-full"
          data-testid="image-slot"
          width="190"
          height="190"
          :loading="lazy && !priority ? 'lazy' : undefined"
          :fetchpriority="priority ? 'high' : undefined"
          :preload="priority"
          format="webp"
        />
      </NuxtLink>
    </div>
    <div class="p-2 border-t border-neutral-200 typography-text-sm">
      <NuxtLink :to="`${paths.product}${slug}`" class="no-underline text-inherit">
        {{ name }}
      </NuxtLink>
      <div class="flex items-center pt-1">
        <v-rating
          :model-value="rating ?? 0"
          :length="5"
          density="compact"
          size="x-small"
          readonly
          half-increments
          color="amber"
        />
        <NuxtLink to="#" class="ml-1 no-underline text-inherit text-xs">
          {{ ratingCount }}
        </NuxtLink>
      </div>
      <p class="block py-2 font-normal typography-text-xs text-neutral-700 text-justify">
        {{ description }}
      </p>
      <span class="block pb-2 font-bold typography-text-sm" data-testid="product-card-vertical-price">
        ${{ price }}
      </span>
      <v-btn size="small" color="primary" variant="flat">
        <v-icon size="small" class="mr-1">mdi-cart</v-icon>
        {{ $t('addToCartShort') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductCardProps } from '~/components/ui/ProductCard/types';

withDefaults(defineProps<ProductCardProps>(), {
  lazy: true,
  imageAlt: '',
});
</script>
