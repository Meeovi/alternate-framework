<!-- pages/cart.vue -->
<template>
    <div class="cartPage">
      <h2>Shopping Cart</h2>

      <div v-if="cart.loading" class="empty-cart">
        Loading your cart…
      </div>

      <div v-else-if="cart.items.length === 0" class="empty-cart">
        Your cart is empty
      </div>

      <div v-else>
        <div v-for="item in cart.items" :key="item.key" class="cart-item">
          <div class="item-details">
            <h3>{{ item.name }}</h3>
            <p>Price: ${{ item.price }}</p>
            <p>Quantity: {{ item.quantity ?? item.qty }}</p>
          </div>
          <v-btn @click="cart.removeItemByKey(item.key)" color="error">
            Remove
          </v-btn>
        </div>

        <div class="cart-total">
          <h3>Total: ${{ cart.total }}</h3>
        </div>

        <v-btn color="primary" :loading="checkingOut" @click="goToCheckout">
          Proceed to Checkout
        </v-btn>
        <p v-if="checkoutError" class="checkout-error">{{ checkoutError }}</p>
      </div>
    </div>
  </template>

  <script setup>
  import { ref, onMounted } from 'vue'
  import { useCartStore } from '~/stores/cart'

  const cart = useCartStore()
  const checkingOut = ref(false)
  const checkoutError = ref('')

  onMounted(() => {
    cart.fetchCart()
  })

  const goToCheckout = async () => {
    checkoutError.value = ''
    checkingOut.value = true
    try {
      await cart.createCheckoutSession()
    } catch (error) {
      checkoutError.value = 'Unable to start checkout'
    } finally {
      checkingOut.value = false
    }
  }
  </script>

  <style scoped>
  .cartPage {
    padding: 20px;
  }

  .cart-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px;
    border-bottom: 1px solid #eee;
  }

  .cart-total {
    margin-top: 20px;
    text-align: right;
  }

  .empty-cart {
    text-align: center;
    padding: 50px;
  }

  .checkout-error {
    color: #df1b41;
    margin-top: 10px;
  }
  </style>
