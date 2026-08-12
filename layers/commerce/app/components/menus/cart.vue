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
        <v-btn icon="fas fa-x" @click="drawer = false">
        </v-btn>
      </v-card-title>

      <v-divider></v-divider>

      <div class="cart-items">
        <template v-if="cartStore.items.length">
          <v-list>
            <v-list-item v-for="item in cartStore.items" :key="item.key" class="cart-item">
              <v-row align="center">
                <v-col cols="3">
                  <v-img :src="item.image || '/images/placeholder.png'" height="60" width="60" contain></v-img>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-1">{{ item.name }}</div>
                  <div class="text-caption">${{ item.price }}</div>
                  <div class="d-flex align-center mt-2">
                    <v-btn icon size="x-small" @click="cartStore.updateQuantity(item.key, item.quantity - 1)"
                      :disabled="item.quantity <= 1">
                      <v-icon>mdi-minus</v-icon>
                    </v-btn>
                    <span class="mx-2">{{ item.quantity }}</span>
                    <v-btn icon size="x-small" @click="cartStore.updateQuantity(item.key, item.quantity + 1)">
                      <v-icon>mdi-plus</v-icon>
                    </v-btn>
                  </div>
                </v-col>
                <v-col cols="3" class="text-right">
                  <v-btn color="error" icon size="small" @click="cartStore.removeItemByKey(item.key)" aria-label="Remove item">
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
              <span>${{ cartStore.total }}</span>
            </div>
            <div class="d-flex justify-space-between mb-2">
              <span>Shipping:</span>
              <span>Calculated at checkout</span>
            </div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between font-weight-bold">
              <span>Total:</span>
              <span>${{ cartStore.total }}</span>
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
        <v-btn color="error" block @click="handleClearCart" :disabled="!cartStore.items.length"
          aria-label="Clear shopping cart">
          Clear Cart
        </v-btn>
      </v-card-actions>

      <!-- Checkout Button -->
      <v-card-actions class="checkout-section">
        <v-btn color="primary" block :loading="loading" @click="handleCheckout" :disabled="!cartStore.items.length"
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
import { ref, computed } from 'vue'
import { useCartStore } from '../../stores/cart'

const cartNotification = ref(false)
const notificationMessage = ref('')
const drawer = ref(false)
const showConfirmDialog = ref(false)
const loading = ref(false)

const cartStore = useCartStore()

const totalQuantity = computed(() =>
  cartStore.items.reduce((total, item) => total + (item?.quantity || 0), 0)
)

const handleCheckout = async () => {
  try {
    loading.value = true
    await cartStore.createCheckoutSession()
  } catch (error) {
    console.error('Checkout error:', import.meta.dev ? error : '')
    showNotification('Unable to start checkout')
  } finally {
    loading.value = false
  }
}

const handleClearCart = () => {
  showConfirmDialog.value = true
}

const confirmClear = () => {
  cartStore.clearCart()
  showConfirmDialog.value = false
  showNotification('Cart cleared')
  drawer.value = false
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