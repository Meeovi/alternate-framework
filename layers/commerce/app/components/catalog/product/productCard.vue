<template>
  <div>
    <div class="border border-neutral-200 rounded-md hover:shadow-lg max-w-[300px]">
      <div class="relative" v-if="product?.image?.length > 0">
        <NuxtLink :to="`/product/${product?.id}`" class="block">
          <img :src="`${$directus.url}assets/${product?.image?.filename_disk}`" :alt="product?.name"
            class="block object-cover h-auto rounded-md aspect-square" width="300" height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square
          class="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 rounded-full!"
          aria-label="Add to wishlist">
          <v-icon icon="fas fa-heart" size="sm"></v-icon>
        </v-btn>
      </div>

      <div class="relative" v-else>
        <NuxtLink :to="`/product/${product?.id}`" class="block">
          <img src="~/assets/images/mbr-1920x1893.png" :alt="product?.name"
            class="block object-cover h-auto rounded-md aspect-square" width="300" height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square
          class="absolute bottom-0 right-0 mr-2 mb-2 bg-white ring-1 ring-inset ring-neutral-200 rounded-full!"
          aria-label="Add to wishlist">
          <v-icon icon="fas fa-heart" size="sm"></v-icon>
        </v-btn>
      </div>
      <div class="p-4 border-t border-neutral-200" style="background-color: white !important;">
        <NuxtLink :to="`/product/${product?.id}`" variant="secondary" class="no-underline"> {{ product?.name }}
        </NuxtLink>
        <div class="flex items-center pt-1">
          <v-rating size="xs" active-color="warning" :model-value="product?.rating" :max="5" />

          <NuxtLink :to="`/product/${product?.id}`" variant="secondary" class="pl-1 no-underline">
            <v-chip size="xs">{{ product?.rating }}</v-chip>
          </NuxtLink>
        </div>
        <p class="block py-2 font-normal leading-5 typography-text-sm text-neutral-700"
          v-if="product?.brands.length > 0">
          By:
        <div style="display: inline-block;" v-for="brands in product?.brands" :key="brands">
          <NuxtLink :to="`/brand/${brands?.brands_id?.slug}`">{{ brands?.brands_id?.name }}</NuxtLink></div>
        </p>
        <span class="block pb-2 font-bold typography-text-lg">
          <div style="display: inline-block;" v-for="currency in product?.currency" :key="currency">
            {{ currency?.currency_id?.symbol }}
          </div>
          {{ product?.price }}
        </span>
        <!--<v-btn size="sm">
          <template #prefix>
            <SfIconShoppingCart size="sm" />
          </template>
          Add to cart
        </v-btn>-->
      </div>
    </div>
  </div>
</template>

<script setup>
    const {
    $directus
  } = useNuxtApp()

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });
</script>