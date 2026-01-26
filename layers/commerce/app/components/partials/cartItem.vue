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
          <button
            class="px-2 py-1 text-gray-600 hover:bg-gray-100"
            @click="updateQuantity(item.id, item.quantity - 1)"
            :disabled="item.quantity <= 1"
          >
            -
          </button>
          <span class="px-4 py-1">{{ item.quantity }}</span>
          <button
            class="px-2 py-1 text-gray-600 hover:bg-gray-100"
            @click="updateQuantity(item.id, item.quantity + 1)"
          >
            +
          </button>
        </div>
        <button
          class="ml-4 text-sm text-red-600 hover:text-red-800"
          @click="removeItem(item.id)"
        >
          Remove
        </button>
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

// Prepare a product object compatible with productCard.vue
const productForCard = computed(() => {
  const pv = props.item?.productVariant || {};
  return {
    id: pv?.product?.id || pv?.id || props.item?.id,
    name: pv?.name || pv?.product?.name,
    image: pv?.featuredAsset ? { filename_disk: pv.featuredAsset?.id } : (pv?.product?.image || {}),
    brands: pv?.product?.brands || [],
    currency: pv?.product?.currency || [],
    price: (props.item?.unitPriceWithTax && props.item.unitPriceWithTax / 100) || pv?.price || 0,
    rating: pv?.product?.rating || 0,
  };
});

const productForCardPrice = computed(() => productForCard.value?.price || 0);

async function removeItem(orderLineId: string) {
  try {
    // Try to delete using Directus client
    try {
      if (nuxtApp.$directus && nuxtApp.$directus.items) {
        await nuxtApp.$directus.items('order_lines').delete(orderLineId);
      } else if (nuxtApp.$deleteItem) {
        await nuxtApp.$deleteItem('order_lines', orderLineId);
      }
    } catch (e) {
      console.warn('Directus delete failed, falling back to plugin helper or ignoring', e);
    }

    emit('cart-changed');
  } catch (error) {
    console.error('Failed to remove item:', error);
  }
}

async function updateQuantity(orderLineId: string, newQuantity: number) {
  if (newQuantity < 1) return;
  try {
    // Try to update via Directus SDK
    try {
      if (nuxtApp.$directus && nuxtApp.$directus.items) {
        await nuxtApp.$directus.items('order_lines').update(orderLineId, { quantity: newQuantity });
      } else if (nuxtApp.$createItem) {
        // Fallback: read existing, delete and recreate with new quantity
        const existing = await nuxtApp.$readItem('order_lines', orderLineId).catch(() => null);
        if (existing) {
          await nuxtApp.$deleteItem('order_lines', orderLineId).catch(() => null);
          const payload = { ...existing, quantity: newQuantity };
          delete payload.id;
          await nuxtApp.$createItem('order_lines', payload).catch(() => null);
        }
      }
    } catch (e) {
      console.warn('Directus update fallback failed', e);
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