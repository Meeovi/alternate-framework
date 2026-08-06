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
    computed
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
    return cart.items.find(
      (item) => item.productId === productId.value || item.id === productId.value,
    )
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
      if (inCartItem.value) {
        cart.updateQuantity(inCartItem.value.key, inCartQty.value + qtyToAdd)
      } else {
        await cart.addItem({
          productId: productId.value,
          id: productId.value,
          sku: productSku.value,
          name: productName.value,
          price: productPrice.value,
          qty: qtyToAdd,
          quantity: qtyToAdd,
        })
      }
    } catch (error) {
      console.error('Failed to add item to cart:', error)
    } finally {
      loading.value = false
    }
  }
</script>