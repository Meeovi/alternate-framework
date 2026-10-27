<template>
  <div>
    <div class="product-card rounded-md hover:shadow-lg">
      <div class="product-card__media">
        <NuxtLink :to="productPath" class="block">
          <!-- The placeholder is a static file that needs no transform —
               render it as a plain <img>; only real provider-backed images
               go through NuxtImg. -->
          <img v-if="isPlaceholder" :src="imageSrc" :alt="product?.name"
            class="block object-cover w-full h-auto rounded-md aspect-square" width="300" height="300" >
          <NuxtImg v-else provider="cloudinary" :src="imageSrc" :alt="product?.name"
            @error="onImageError" class="block object-cover w-full h-auto rounded-md aspect-square" width="300"
            height="300" />
        </NuxtLink>
        <v-btn variant="flat" size="sm" square color="surface"
          class="product-card__wishlist"
          :aria-label="inWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
          @click="wishlistStore.toggleItem(wishlistKey)">
          <v-icon icon="fas fa-heart" size="sm" :color="inWishlist ? 'red' : undefined"></v-icon>
        </v-btn>
      </div>

      <div class="product-card__body p-4">
        <NuxtLink :to="productPath" class="no-underline"> {{ product?.name }}
        </NuxtLink>
        <div class="flex items-center pt-1">
          <MeeoviRating type="product" :id="product?.id" summary />
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
        <!-- Add to Cart, Install (free integration) or Download (free file). -->
        <AddToCartBtn :product="product" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'
import { useImageFallback } from '#shared/app/composables/media/useImageFallback'

  import { computed, onMounted } from 'vue'
  import { usePrice } from '../../../composables/catalog/price/price'
  import { useWishlistStore } from '../../../stores/wishlist/useWishlistStore'
  import AddToCartBtn from '../../blocks/addToCartBtn.vue'
  import { productKey } from '../../../utils/productKey'

  const { getProductPrice } = usePrice()
  const wishlistStore = useWishlistStore()

  const props = defineProps({
    product: {
      type: Object,
      required: true,
    },
  });

  const pricing = computed(() => getProductPrice(props.product || {}))
  // Directus id, or `magento:<sku>` for a commerce backend's product.
  const productPath = computed(() => `/product/${encodeURIComponent(productKey(props.product))}`)
  // The heart saves to the user's Wishlist list (stores/wishlist), by the
  // same key as cart lines and product links.
  const wishlistKey = computed(() => productKey(props.product))
  const inWishlist = computed(() => wishlistStore.hasItem(wishlistKey.value))
  onMounted(() => { wishlistStore.load() })

  // getProductPrice() returns a pre-formatted string, but when the backend
  // omits price metadata it's null and the template fell back to the raw
  // `product.price` number ("19.99" with no currency). Format that fallback
  // the same way rather than showing a bare number.
  const displayPrice = computed(() => {
    if (!((pricing.value?.final ?? Number(props.product?.price)) > 0)) return 'Free'
    if (pricing.value?.formatted?.final) return pricing.value.formatted.final
    const raw = Number(props.product?.price)
    if (!Number.isFinite(raw)) return props.product?.price ?? ''
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: pricing.value?.currency || 'USD',
      }).format(raw)
    } catch {
      // Unlike getProductPrice()'s own formatAmount(), this manual
      // fallback had no guard against Intl.NumberFormat throwing on a bad
      // currency value — a single malformed product crashed the whole SSR
      // render. Degrade to a plain number instead of taking the page down.
      return raw.toFixed(2)
    }
  })

  // provider="cloudinary" is misconfigured in most environments (falls back
  // to a placeholder cloud name — see layers/shared/nuxt.config.ts — so
  // product images 404 until CLOUDINARY_CLOUD_NAME is set for real);
  // failsafe to a generic placeholder rather than a broken-image icon.
  // isPlaceholder also drives swapping NuxtImg for a plain <img> below once
  // showing it — the placeholder is a static file that needs no transform.
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

/* Image is the positioning context so the heart sits on the image's
   top-right corner rather than the whole card's. */
.product-card__media {
  position: relative;
}

.product-card__media img {
  width: 100%;
}

.product-card__wishlist {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 1;
  border-radius: 9999px;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.product-card__muted {
  color: rgba(var(--v-theme-on-surface), 0.7);
}
</style>