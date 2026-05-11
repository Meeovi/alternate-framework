<template>
  <div class="flex items-center py-4 border-b border-gray-200">
    <div class="shrink-0 w-24 h-24">
      <productCard :product="productForCard" />
    </div>
    <div class="ml-4 flex-1">
      <h3 class="text-lg font-medium text-gray-900">{{ item.productVariant?.name }}</h3>
      <p class="mt-1 text-sm text-gray-500">SKU: {{ item.productVariant?.sku }}</p>
      <div class="mt-2 flex items-center">
        <div class="flex items-center border border-gray-300 rounded">
          <v-btn
            class="px-2 py-1 text-gray-600 hover:bg-gray-100"
            @click="updateQuantity(item.id, item.quantity - 1)"
            :disabled="item.quantity <= 1"
          >
            -
          </v-btn>
          <span class="px-4 py-1">{{ item.quantity }}</span>
          <v-btn
            class="px-2 py-1 text-gray-600 hover:bg-gray-100"
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
      <p class="text-lg font-medium text-gray-900">
        {{ formatPrice(item.unitPriceWithTax || productForCardPrice) }}
      </p>
      <p v-if="item.listPriceWithTax && item.listPriceWithTax !== item.unitPriceWithTax" class="mt-1 text-sm text-gray-500 line-through">
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
// Use injected composables for Directus
const { directus, deleteItem, readItem, createItem } = nuxtApp;

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