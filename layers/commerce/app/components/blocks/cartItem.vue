<template>
  <div class="cart-item flex items-center py-4">
    <div class="shrink-0 w-24 h-24">
      <productCard :product="productForCard" />
    </div>
    <div class="ml-4 flex-1">
      <h3 class="text-lg font-medium">{{ item.productVariant?.name }}</h3>
      <p class="cart-item__muted mt-1 text-sm">SKU: {{ item.productVariant?.sku }}</p>
      <div class="mt-2 flex items-center">
        <div class="cart-item__stepper flex items-center rounded">
          <v-btn
            class="px-2 py-1"
            @click="updateQuantity(item.id, item.quantity - 1)"
            :disabled="item.quantity <= 1"
          >
            -
          </v-btn>
          <span class="px-4 py-1">{{ item.quantity }}</span>
          <v-btn
            class="px-2 py-1"
            @click="updateQuantity(item.id, item.quantity + 1)"
          >
            +
          </v-btn>
        </div>
        <v-btn
          class="ml-4 text-sm text-red-600 hover:text-red-800"
          @click="removeItem(item.id)"
        >
          Remove
        </v-btn>
      </div>
    </div>
    <div class="ml-4 text-right">
      <p class="text-lg font-medium">
        {{ formatPrice(item.unitPriceWithTax || productForCardPrice) }}
      </p>
      <p v-if="item.listPriceWithTax && item.listPriceWithTax !== item.unitPriceWithTax" class="cart-item__muted mt-1 text-sm line-through">
        {{ formatPrice(item.listPriceWithTax) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import productCard from '../catalog/product/productCard.vue';
import { computed } from 'vue';

const props = defineProps<{ item: Record<string, any> }>();
const emit = defineEmits(['cart-changed'])
const nuxtApp = useNuxtApp()
// Use injected content adapter methods from the app gateway
const { deleteItem, readItem, createItem } = nuxtApp;

// Prepare a product object compatible with productCard.vue
const productForCard = computed(() => {
  const pv = props.item?.productVariant || {};
  return {
    id: pv?.product?.id || pv?.id || props.item?.id,
    name: pv?.name || pv?.product?.name,
    image: pv?.featuredAsset ? { id: pv.featuredAsset?.id } : (pv?.product?.image || {}),
    brands: pv?.product?.brands || [],
    currency: pv?.product?.currency || [],
    price: (props.item?.unitPriceWithTax && props.item.unitPriceWithTax / 100) || pv?.price || 0,
    rating: pv?.product?.rating || 0,
  };
});

const productForCardPrice = computed(() => productForCard.value?.price || 0);

async function removeItem(orderLineId: string) {
  try {
    if (deleteItem) {
      await (deleteItem as any)?.('order_lines', orderLineId);
    }
    emit('cart-changed');
  } catch (error) {
    console.error('Failed to remove item:', error);
  }
}

async function updateQuantity(orderLineId: string, newQuantity: number) {
  if (newQuantity < 1) return;
  try {
    // Fallback: read existing, delete and recreate with new quantity
    const existing = await (readItem as any)?.('order_lines', orderLineId).catch(() => null);
    if (existing) {
      await (deleteItem as any)?.('order_lines', orderLineId).catch(() => null);
      const payload = { ...existing, quantity: newQuantity };
      delete payload.id;
      await (createItem as any)?.('order_lines', payload).catch(() => null);
    }
    emit('cart-changed');
  } catch (error) {
    console.error('Failed to update quantity:', error);
  }
}

function formatPrice(price: number) {
  const p = price ?? 0;
  // If price seems to be in cents (large integer), convert
  const normalized = p > 1000 ? p / 100 : p;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(normalized);
}
</script>

<style scoped>
/* Theme-aware so the row stays legible under the Vuetify light/dark toggle
   (was hard-coded text-gray-900 / border-gray-200 Tailwind values). */
.cart-item {
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  color: rgb(var(--v-theme-on-surface));
}

.cart-item__muted {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.cart-item__stepper {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}
</style>