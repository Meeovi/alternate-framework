<template>
  <div>
    <div class="product-card rounded-md hover:shadow-lg">
      <div class="relative">
        <NuxtLink :to="`/product/${product?.id}`" class="block">
          <!-- The placeholder is an external absolute URL that isn't in
               image.domains, so NuxtImg/IPX would blank it — render it as a
               plain <img>; only real provider-backed images go through NuxtImg. -->
          <img v-if="isPlaceholder" :src="imageSrc" :alt="product?.name"
            class="block object-cover w-full h-auto rounded-md aspect-square" width="300" height="300" >
          <NuxtImg v-else provider="cloudinary" :src="imageSrc" :alt="product?.name"
            @error="onImageError" class="block object-cover h-auto rounded-md aspect-square" width="300"
            height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square color="surface"
          class="product-card__wishlist absolute bottom-0 right-0 mr-2 mb-2 rounded-full!"
          :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
          @click="wishlistStore.toggleItem(product?.id)">
          <v-icon icon="fas fa-heart" size="sm" :color="inWishlist ? 'red' : undefined"></v-icon>
        </v-btn>
      </div>

      <div class="product-card__body p-4">
        <NuxtLink :to="`/product/${product?.id}`" class="no-underline"> {{ product?.name }}
        </NuxtLink>
        <div class="flex items-center pt-1">
          <v-rating size="xs" active-color="warning" :model-value="product?.rating" :max="5" />

          <NuxtLink :to="`/product/${product?.id}`" class="pl-1 no-underline">
            <v-chip size="xs">{{ product?.rating }}</v-chip>
          </NuxtLink>
        </div>
        <p class="product-card__muted block py-2 font-normal leading-5 typography-text-sm">
          By: {{ product?.shops?.[0]?.shops_id?.name }}
        </p>
        <span class="block pb-1 font-bold typography-text-lg">
          {{ displayPrice }}
        </span>
        <span v-if="pricing?.hasDiscount" class="product-card__muted block pb-2 text-sm">
          <s>{{ pricing?.formatted?.regular }}</s>
          <span class="pl-1">{{ pricing?.discountPercent }}% off</span>
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
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { useImageFallback } from '#shared/app/composables/media/useImageFallback'

  import { computed } from 'vue'
  import { usePrice } from '../../../composables/catalog/price/price'
  import { useWishlistStore } from '../../../stores/wishlist/useWishlistStore'

  const { getProductPrice } = usePrice()
  const wishlistStore = useWishlistStore()

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });

  const pricing = computed(() => getProductPrice(props.product || {}))
  const inWishlist = computed(() => wishlistStore.hasItem(props.product?.id))

  // getProductPrice() returns a pre-formatted string, but when the backend
  // omits price metadata it's null and the template fell back to the raw
  // `product.price` number ("19.99" with no currency). Format that fallback
  // the same way rather than showing a bare number.
  const displayPrice = computed(() => {
    if (pricing.value?.formatted?.final) return pricing.value.formatted.final
    const raw = Number(props.product?.price)
    if (!Number.isFinite(raw)) return props.product?.price ?? ''
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: pricing.value?.currency || 'USD',
    }).format(raw)
  })

  // provider="cloudinary" is misconfigured in most environments (falls back
  // to a placeholder cloud name — see layers/shared/nuxt.config.ts — so
  // product images 404 until CLOUDINARY_CLOUD_NAME is set for real);
  // failsafe to a generic placeholder rather than a broken-image icon.
  // isPlaceholder also drives swapping NuxtImg for a plain <img> below once
  // showing it — the placeholder is a complete, absolute URL that needs no
  // transform, and isn't in `image.domains`, so NuxtImg/IPX would blank it.
  const { src: imageSrc, isPlaceholder, onError: onImageError } = useImageFallback(computed(() => getAssetURL(props.product?.image)))
</script>

<style scoped>
/* Theme-aware surfaces so the card follows the Vuetify light/dark toggle
   instead of the old hard-coded white / neutral-* Tailwind values. */
.product-card {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
  max-width: 300px;
}

.product-card__body {
  border-top: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background-color: rgb(var(--v-theme-surface));
}

.product-card__wishlist {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.product-card__muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>