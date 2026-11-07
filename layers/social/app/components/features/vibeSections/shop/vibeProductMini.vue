<template>
  <div class="vibe-product-mini" :class="{ 'vibe-product-mini--dark': dark }">
    <NuxtLink :to="path" class="vibe-product-mini__media" :aria-label="product?.name">
      <img :src="image" :alt="product?.name" loading="lazy" decoding="async" width="56" height="56">
    </NuxtLink>
    <div class="vibe-product-mini__body">
      <NuxtLink :to="path" class="vibe-product-mini__name">{{ product?.name }}</NuxtLink>
      <div class="vibe-product-mini__meta">
        <span class="font-weight-bold">{{ price }}</span>
        <span v-if="at" class="text-medium-emphasis"> · at {{ at }}</span>
      </div>
    </div>
    <div class="vibe-product-mini__actions">
      <addToCartBtn :product="product" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import addToCartBtn from '#commerce/app/components/blocks/addToCartBtn.vue'
import { productKey } from '#commerce/app/utils/productKey'
import { PLACEHOLDER_IMAGE_URL, getAssetURL } from '#shared/app/utils/get-asset-url'

/** One product on a shoppable vibe: picture, name, price and Add to cart. */
const props = defineProps<{ product: Record<string, any>, at?: string, dark?: boolean }>()

const path = computed(() => `/product/${encodeURIComponent(productKey(props.product))}`)
const image = computed(() => getAssetURL(props.product?.image || props.product?.image_url) || PLACEHOLDER_IMAGE_URL)
const price = computed(() => {
  const value = Number(props.product?.price)
  if (!(value > 0)) return 'Free'
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: String(props.product?.currency_code || 'USD').toUpperCase() }).format(value)
  } catch {
    return value.toFixed(2)
  }
})
</script>

<style scoped>
.vibe-product-mini {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 10px;
  background: rgb(var(--v-theme-surface));
  color: rgb(var(--v-theme-on-surface));
}

.vibe-product-mini--dark {
  background: rgba(0, 0, 0, 0.72);
  color: #fff;
  backdrop-filter: blur(6px);
}

.vibe-product-mini__media img {
  display: block;
  width: 56px;
  height: 56px;
  object-fit: cover;
  border-radius: 8px;
}

.vibe-product-mini__body {
  flex: 1;
  min-width: 0;
}

.vibe-product-mini__name {
  display: block;
  overflow: hidden;
  color: inherit;
  font-weight: 600;
  text-decoration: none;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vibe-product-mini__meta {
  font-size: 0.85rem;
}

.vibe-product-mini__actions :deep(.v-btn) {
  text-transform: none;
}
</style>
