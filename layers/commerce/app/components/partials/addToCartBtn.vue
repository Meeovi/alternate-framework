<template>
  <div class="flex flex-col gap-2">
    <UButton size="lg" class="w-full xs:ml-4" :disabled="loading || hasItemInCart" @click="addToCart">
      <template #prefix>
        <SfIconShoppingCart size="sm" />
      </template>
      Add to Cart
    </UButton>
    <compareBtn />
  </div>
</template>

<script setup>
import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()
import { SfIconShoppingCart } from "@storefront-ui/vue";
import compareBtn from './compareBtn.vue';
import { useCartStore } from '~/stores/cart'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const cart = useCartStore()

const addToCart = async (product) => {
  try {
    await cart.addItem({
      sku: product.sku,
      name: product.name,
      price: product.price,
      qty: 1
    })
  } catch (error) {
    // Handle error (show notification, etc.)
    console.error('Failed to add item to cart:', error)
  }
}
</script>