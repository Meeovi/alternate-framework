<template>
  <div>
    <!-- Shopping Cart Button -->
    <v-btn class="relative" icon="fas fa-basket-shopping" variant="text" @click.stop="drawer = !drawer"
      aria-label="Shopping Cart">
    </v-btn>
    <v-badge :content="totalQuantity" :value="totalQuantity" color="error" overlap />

    <!-- Cart Notification -->
    <v-snackbar v-model="cartNotification" timeout="2000" color="success">
      {{ notificationMessage }}
    </v-snackbar>

    <!-- Flyout Menu -->
    <v-navigation-drawer v-model="drawer" location="right" temporary class="cart-flyout">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Shopping Cart</span>
        <v-btn icon="fas:fa fa-x" @click="drawer = false">
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <div class="cart-items">
        <template v-if="cartStore?.items?.length">
          <v-list>
            <v-list-item v-for="item in cartStore?.items || []" :key="item.id" class="cart-item">
              <v-row align="center">
                <v-col cols="3">
                  <v-img :src="item.image || '/images/placeholder.png'" height="60" width="60" contain></v-img>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-1">{{ item.name }}</div>
                  <div class="text-caption">${{ item.price }}</div>
                  <div class="d-flex align-center mt-2">
                    <v-btn icon size="x-small" @click="updateQuantity(item.id, item.quantity - 1)"
                      :disabled="item.quantity <= 1">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <span class="mx-2">{{ item.quantity }}</span>
                    <v-btn icon size="x-small" @click="updateQuantity(item.id, item.quantity + 1)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="3" class="text-right">
                  <v-btn color="error" icon size="small" @click="removeFromCart(item.id)" aria-label="Remove item">
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </v-col>
              </v-row>
            </v-list-item>
          </v-list>

          <v-divider class="my-4"></v-divider>

          <div class="px-4">
            <div class="d-flex justify-space-between mb-2">
              <span>Subtotal:</span>
              <span>${{ cartStore?.totalPrice || 0 }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between font-weight-bold">
              <span>Total:</span>
              <span>${{ cartStore?.totalPrice || 0 }}</span>
            </div>
          </div>
        </template>
        <template v-else>
          <v-alert type="info" class="mt-4 mx-4">
            Your cart is empty
          </v-alert>
        </template>
      </div>

      <!-- Cart Actions -->
      <v-card-actions class="checkout-section">
        <v-btn color="error" block @click="handleClearCart" :disabled="!cartStore?.items?.length"
          aria-label="Clear shopping cart">
          Clear Cart
        </v-btn>
      </v-card-actions>

      <!-- Checkout Button -->
      <v-card-actions class="checkout-section">
        <v-btn color="primary" block @click="handleCheckout" :disabled="!cartStore?.items?.length"
          aria-label="Proceed to checkout">
          Proceed to Checkout
        </v-btn>
      </v-card-actions>

      <!-- Checkout handled via Stripe Checkout (server-created session) -->
    </v-navigation-drawer>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="showConfirmDialog" max-width="400">
      <v-card>
        <v-card-title>Clear Cart?</v-card-title>
        <v-card-text>
          Are you sure you want to clear your cart?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="showConfirmDialog = false">Cancel</v-btn>
          <v-btn color="error" @click="confirmClear">Clear Cart</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../../../stores/cart'
import { useCart } from '../../composables/sales/cart/useCart/useCart'
import { useNuxtApp } from '#app'

const cartNotification = ref(false)
const notificationMessage = ref('')
const drawer = ref(false)
const router = useRouter()
const showConfirmDialog = ref(false)
const loading = ref(false)
const cartId = useCookie('magento_cart_id')

const cartStore = process.client ? useCartStore() : null
const { removeFromCart, updateCartItem, fetchCart, clearCart: clearCartItems } = process.client
  ? useCart()
  : { removeFromCart: () => {}, updateCartItem: () => {}, fetchCart: () => {}, clearCart: () => {} }

onMounted(async () => {
  if (process.client) await fetchCart()
})

const totalQuantity = computed(() => {
  if (!process.client || !cartStore || !cartStore.items) return 0
  return cartStore.items.reduce((total, item) => total + (item?.quantity || 0), 0)
})

const updateQuantity = async (itemId, newQuantity) => {
  try {
    loading.value = true
    await updateCartItem(itemId, newQuantity)
    showNotification('Cart updated')
  } catch (error) {
    console.error('Error updating quantity:', error)
  } finally {
    loading.value = false
  }
}

const nuxtApp = useNuxtApp()
const handleCheckout = async () => {
  try {
    loading.value = true
    if (!cartStore || !cartStore.createCheckoutSession) {
      showNotification('Checkout is not available')
      return
    }

    const data = await cartStore.createCheckoutSession(cartStore?.cart?.id)
    const url = data?.url || (data?.id ? `https://checkout.stripe.com/pay/${data.id}` : null)
    if (url) {
      window.location.href = url
      return
    }

    const injectedStripe = nuxtApp?.$stripe || (typeof useStripe === 'function' ? useStripe() : null)
    if (injectedStripe && typeof injectedStripe.redirectToCheckout === 'function' && data?.id) {
      await injectedStripe.redirectToCheckout({ sessionId: data.id })
      return
    }

    showNotification('Failed to start checkout')
  } catch (error) {
    console.error('Checkout error:', error)
    showNotification('Error starting checkout')
  } finally {
    loading.value = false
  }
}

const handleClearCart = () => {
  showConfirmDialog.value = true
}

const confirmClear = async () => {
  try {
    await clearCartItems()
    showConfirmDialog.value = false
    showNotification('Cart cleared')
    drawer.value = false
  } catch (error) {
    console.error('Error clearing cart:', error)
  }
}

const showNotification = (message) => {
  notificationMessage.value = message
  cartNotification.value = true
}
</script>

<style scoped>
  .cart-flyout {
    width: 400px;
  }

  .cart-items {
    padding: 16px;
    height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .checkout-section {
    position: relative;
    bottom: 0;
    width: 100%;
    padding: 16px;
    background: white;
    border-top: 1px solid #e0e0e0;
  }

  .cart-item {
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 0;
  }
</style>