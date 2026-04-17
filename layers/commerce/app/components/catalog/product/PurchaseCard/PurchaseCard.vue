<template>
  <section
    class="p-4 xl:p-6 md:border md:border-neutral-100 md:shadow-lg md:rounded-md md:sticky md:top-20"
    data-testid="purchase-card"
  >
    <v-chip class="mb-4" color="secondary" variant="tonal">
      <v-icon size="small" class="mr-1">mdi-sale</v-icon>
      <span class="mr-1">{{ $t(`sale`) }}</span>
    </v-chip>
    <h1 class="mb-1 font-bold typography-headline-4" data-testid="product-name">{{ product.name }}</h1>
    <div class="my-1">
      <span class="mr-2 text-secondary-700 font-bold font-headings text-2xl" data-testid="price">
        ${{ product.price?.value.amount }}
      </span>
      <span class="text-base font-normal text-neutral-500 line-through">
        ${{ product.price?.regularPrice.amount }}
      </span>
    </div>
    <div class="inline-flex items-center mt-4 mb-2 gap-2">
      <v-rating
        :model-value="product.rating?.average ?? 0"
        :length="5"
        readonly
        density="compact"
        size="x-small"
        half-increments
        color="amber"
      />
      <span class="text-xs">{{ product.rating?.count }}</span>
      <NuxtLink to="#" class="ml-2 text-xs text-neutral-500 no-underline">
        {{ $t('reviewsCount', { count: product.rating?.count }) }}
      </NuxtLink>
    </div>
    <p class="mb-4 font-normal typography-text-sm" data-testid="product-description">
      {{ product.description }}
    </p>
    <div class="py-4 mb-4 border-gray-200 border-y">
      <v-chip class="w-full mb-4" color="secondary" variant="tonal">
        <v-icon size="small" class="mr-1">mdi-cart-check</v-icon>
        {{ $t('numberInCart', { count: 1 }) }}
      </v-chip>
      <div class="flex flex-col md:flex-row flex-wrap gap-4">
        <QuantitySelector :value="quantitySelectorValue" class="min-w-[145px] flex-grow flex-shrink-0 basis-0" />
        <v-btn size="large" color="primary" class="flex-grow-[2] flex-shrink basis-auto whitespace-nowrap">
          <v-icon size="small" class="mr-1">mdi-cart</v-icon>
          {{ $t('addToCart') }}
        </v-btn>
      </div>
      <div class="flex justify-center mt-4 gap-x-4">
        <v-btn size="small" variant="text">
          <v-icon size="small" class="mr-1">mdi-compare</v-icon>
          {{ $t('compare') }}
        </v-btn>
        <v-btn size="small" variant="text">
          <v-icon size="small" class="mr-1">mdi-heart-outline</v-icon>
          {{ $t('addToList') }}
        </v-btn>
      </div>
    </div>
    <div class="flex first:mt-4">
      <v-icon size="small" class="flex-shrink-0 mr-1 text-neutral-500">mdi-package-variant</v-icon>
      <p class="text-sm">
        <i18n-t keypath="additionalInfo.shipping">
          <template #addAddress>
            <NuxtLink to="#" class="text-secondary no-underline">{{ $t('additionalInfo.addAddress') }}</NuxtLink>
          </template>
        </i18n-t>
      </p>
    </div>
    <div class="flex mt-4">
      <v-icon size="small" class="flex-shrink-0 mr-1 text-neutral-500">mdi-warehouse</v-icon>
      <p class="text-sm">
        <i18n-t keypath="additionalInfo.pickup">
          <template #checkAvailability>
            <NuxtLink to="#" class="text-secondary no-underline">{{ $t('additionalInfo.checkAvailability') }}</NuxtLink>
          </template>
        </i18n-t>
      </p>
    </div>
    <div class="flex mt-4">
      <p class="text-sm">
        <v-icon size="small" class="flex-shrink-0 mr-1 text-neutral-500">mdi-shield-check</v-icon>
        <i18n-t keypath="additionalInfo.returns">
          <template #details>
            <NuxtLink to="#" class="text-secondary no-underline">{{ $t('additionalInfo.details') }}</NuxtLink>
          </template>
        </i18n-t>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { PurchaseCardProps } from '~/components/ui/PurchaseCard/types';

defineProps<PurchaseCardProps>();

const quantitySelectorValue = ref(1);
</script>
