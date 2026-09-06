<template>
  <div>
    <v-btn color="orange" variant="outlined" :disabled="loading" :loading="loading" @click="handleAddToCart"
      prepend-icon="fas fa-shopping-cart">
      {{ buttonLabel }}
    </v-btn>
  </div>
</template>

<script setup>
  import {
    ref,
    computed,
    onMounted
  } from 'vue'
  import {
    useCartStore
  } from '~/stores/cart'

  const props = defineProps({
    product: {
      type: [Object, String, Number],
      required: true,
    },
    quantity: {
      type: Number,
      default: 1,
    },
  })

  const cart = useCartStore()
  const loading = ref(false)

  // A listing page can mount dozens of these at once — the store dedupes
  // concurrent calls into a single request, so this doesn't fan out into
  // one fetch per button.
  onMounted(() => {
    cart.fetchCart()
  })

  const productId = computed(() => {
    if (typeof props.product === 'object' && props.product !== null) {
      return props.product.id ?? props.product.uid ?? props.product.product_id ?? null
    }
    return props.product
  })

  const productSku = computed(() => {
    if (typeof props.product === 'object' && props.product !== null) {
      return props.product.sku ?? props.product.uid ?? String(props.product.id ?? '')
    }
    return String(props.product ?? '')
  })

  const productName = computed(() => {
    if (typeof props.product === 'object' && props.product !== null) {
      return props.product.name ?? ''
    }
    return ''
  })

  const productPrice = computed(() => {
    if (typeof props.product === 'object' && props.product !== null) {
      return props.product.price ?? props.product.price_range?.minimum_price?.regular_price?.value ?? 0
    }
    return 0
  })

  const inCartItem = computed(() => {
    if (!productId.value) return null
    // item.id is now the cart line's own database id (see server/utils/
    // cart.ts's serializeCart), not the product id — only productId
    // identifies which product a line item is for.
    return cart.items.find((item) => String(item.productId) === String(productId.value))
  })

  const inCartQty = computed(() => inCartItem.value?.quantity ?? 0)

  const buttonLabel = computed(() => {
    if (inCartQty.value > 0) return `In Cart (${inCartQty.value})`
    return 'Add to Cart'
  })

  const handleAddToCart = async () => {
    if (!productId.value || loading.value) return

    const qtyToAdd = Number.isFinite(props.quantity) ? props.quantity : 1

    try {
      loading.value = true
      // The cart API merges into an existing line item itself (same
      // product, re-priced from the catalog) — no need to special-case an
      // already-in-cart product here, just always add the requested qty.
      await cart.addItem({
        productId: productId.value,
        id: productId.value,
        sku: productSku.value,
        name: productName.value,
        price: productPrice.value,
        qty: qtyToAdd,
        quantity: qtyToAdd,
      })
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      loading.value = false
    }
  }
</script>