<template>
  <v-sheet class="pa-4" elevation="2">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold">Your Cart ({{ cartStore.itemCount }})</h3>
      <v-btn color="primary" variant="tonal" @click="proceedToCheckout" :disabled="cartStore.isEmpty || cartStore.loading">
        Proceed to Checkout
      </v-btn>
    </div>

    <v-divider />

    <div v-if="cartStore.loading" class="py-6 text-center">Loading cart…</div>

    <div v-else>
      <v-list two-line>
        <v-list-item v-for="item in cartItems" :key="item.id" class="py-4">
          <PartialsCartItem :item="item" @cart-changed="initialize" />
        </v-list-item>
      </v-list>

      <v-divider class="my-4" />

      <div class="flex flex-col gap-2">
        <div class="flex justify-between">
          <span>Subtotal</span>
          <span>{{ formatPrice(cartStore.subtotal) }}</span>
        </div>
        <div class="flex justify-between">
          <span>Tax</span>
          <span>{{ formatPrice(cartStore.taxAmount) }}</span>
        </div>
        <div class="flex justify-between font-semibold text-lg">
          <span>Total</span>
          <span>{{ formatPrice(cartStore.total) }}</span>
        </div>
      </div>
    </div>

    <div v-if="cartStore.error" class="mt-4 text-sm text-error">{{ cartStore.error }}</div>
  </v-sheet>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { useCartStore } from '~/stores/cart'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const router = useRouter()

const placeholder = '/_assets/placeholder.png'

const quantities = ref({})

const cartItems = computed(() => (cartStore.cart?.items || []))

const initialize = async () => {
  await cartStore.initializeCart()
  // initialize local quantity map
  cartItems.value.forEach((it) => {
    quantities.value[it.id] = it.quantity
  })
}

onMounted(() => {
  initialize()
})

watch(cartItems, (newItems) => {
  // keep local quantities in sync when items change
  newItems.forEach((it) => {
    if (!quantities.value[it.id]) quantities.value[it.id] = it.quantity
  })
})

const getImageUrl = (item) => {
  const file = item.product?.images?.[0]
  const config = useRuntimeConfig()
  if (file && file.id) return `${config.public.directus.url}/assets/${file.id}`
  return placeholder
}

const formatPrice = (value) => {
  const amount = typeof value === 'number' ? value : Number(value || 0)
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: cartStore.cart?.currency || 'USD' }).format(amount)
}

const removeItem = async (item) => {
  await cartStore.removeProductFromCart(item.id)
}

const updateQty = async (itemId, qty) => {
  qty = Number(qty)
  if (isNaN(qty) || qty < 1) return
  await cartStore.updateProductQuantity(itemId, qty)
}

const onQtyChange = async (item) => {
  const newQty = quantities.value[item.id]
  await updateQty(item.id, newQty)
}

const increaseQty = async (item) => {
  quantities.value[item.id] = (quantities.value[item.id] || item.quantity) + 1
  await updateQty(item.id, quantities.value[item.id])
}

const decreaseQty = async (item) => {
  const newVal = (quantities.value[item.id] || item.quantity) - 1
  if (newVal <= 0) {
    // remove item
    await removeItem(item)
    return
  }
  quantities.value[item.id] = newVal
  await updateQty(item.id, newVal)
}

const proceedToCheckout = () => {
  // navigate to a checkout route; adjust if project uses a different path
  router.push('/checkout')
}
</script>

<style scoped>
.v-list-item { align-items: flex-start; }
.w-24 { width: 6rem; }
</style>
