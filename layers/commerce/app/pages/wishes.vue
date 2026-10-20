<template>
  <div class="contentPage">
    <v-card variant="text">
      <v-toolbar :style="`background-color: ${wishBar?.color}; color: ${wishBar?.colortext} !important`">
        <v-toolbar-title>
          <div class="listsToolbarTitle">
            {{ wishBar?.name }}
            <v-tooltip interactive>
              <template v-slot:activator="{ props: activatorProps }">
                <v-icon-btn size="small" icon="fas fa-circle-info" v-bind="activatorProps"></v-icon-btn>
              </template>
              <div>
                <p class="listsToolbarTooltip" v-dompurify-html="wishBar?.content"></p>
              </div>
            </v-tooltip>
          </div>
        </v-toolbar-title>

        <v-tabs v-model="tab" align-tabs="center">
          <div v-for="(menu, index) in wishBar?.menus" :key="index">
            <v-tab :value="menu?.value">
              <v-btn variant="text" :style="`color: ${wishBar?.colortext} !important`">{{ menu?.name }}</v-btn>
            </v-tab>
          </div>
        </v-tabs>
      </v-toolbar>
    </v-card>

    <!-- All Wishes (Gift Cards) -->
    <v-tabs-window v-model="tab">
      <v-tabs-window-item :value="wishBar?.menus[0]?.value">
        <v-row>
          <v-col cols="12" sm="6" md="3" v-if="allWishes?.length" v-for="product in allWishes" :key="product.id">
            <productCard :product="product" />
          </v-col>

          <div class="center-text" v-else>No Wishes yet</div>
        </v-row>
      </v-tabs-window-item>

      <!-- Your Wishes (gift cards you received) -->
      <v-tabs-window-item :value="wishBar?.menus[1]?.value">
        <div class="center-text" v-if="!signedIn">Sign in to see the wishes you've received.</div>
        <v-row v-else>
          <v-col cols="12" sm="6" md="3" v-if="yourWishes.length" v-for="(card, i) in yourWishes" :key="`r-${i}`">
            <v-card variant="outlined" class="h-100">
              <v-card-item>
                <v-card-title>{{ money(card.balance) }}</v-card-title>
                <v-card-subtitle>{{ card.sender_name ? `From ${card.sender_name}` : 'Gift card' }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div class="wishes__code">{{ card.code }}</div>
                <p v-if="card.message" class="mt-2">{{ card.message }}</p>
                <div class="d-flex flex-wrap ga-2 mt-3">
                  <v-chip size="small" variant="tonal" :color="STATE_COLORS[card.state]" :text="card.state" />
                  <v-chip v-if="card.expires_at" size="small" variant="tonal" :text="`Expires ${date(card.expires_at)}`" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <div class="center-text" v-else>You haven't received wishes yet.</div>
        </v-row>
      </v-tabs-window-item>

      <!-- Purchased Wishes (gift cards you bought) -->
      <v-tabs-window-item :value="wishBar?.menus[2]?.value">
        <div class="center-text" v-if="!signedIn">Sign in to see the wishes you've bought.</div>
        <v-row v-else>
          <v-col cols="12" sm="6" md="3" v-if="purchasedWishes.length" v-for="(card, i) in purchasedWishes" :key="`p-${i}`">
            <v-card variant="outlined" class="h-100">
              <v-card-item>
                <v-card-title>{{ card.product_name || 'Gift card' }}</v-card-title>
                <v-card-subtitle>
                  {{ card.recipient_name || card.recipient_email ? `For ${card.recipient_name || card.recipient_email}` : 'For you' }}
                </v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div class="wishes__code">{{ card.code || card.masked_code || 'Code on its way' }}</div>
                <div class="d-flex flex-wrap ga-2 mt-3">
                  <v-chip size="small" variant="tonal" :color="STATE_COLORS[card.state]" :text="card.state" />
                  <v-chip v-if="card.balance != null" size="small" variant="tonal" :text="money(card.balance)" />
                  <v-chip v-if="card.order_number" size="small" variant="tonal" :text="`Order ${card.order_number}`" />
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <div class="center-text" v-else>No Purchased Wishes</div>
        </v-row>
      </v-tabs-window-item>
    </v-tabs-window>
  </div>
</template>

<script setup>
  import {
    computed,
    ref
  } from 'vue'
  import productCard from '../components/catalog/product/productCard.vue'

  const {
    $directus,
    $readItem
  } = useNuxtApp()

  const tab = ref(null)

  const {
    data: wishBar
  } = await useAsyncData('wishBar', () => {
    return $directus.request($readItem('navigation', '126', {
      fields: ['*', {
        '*': ['*']
      }]
    }))
  })

  // All Wishes: gift card products from the commerce backends that sell them
  // (server/api/commerce/wishes/products).
  const { data: products } = await useFetch('/api/commerce/wishes/products', {
    key: 'wishes-products',
    default: () => ({ products: [] }),
  })
  const allWishes = computed(() => products.value?.products ?? [])

  // Your Wishes + Purchased Wishes: the signed-in user's own gift cards
  // (server/api/commerce/wishes/mine). 401 when signed out.
  const { data: mine, error: mineError } = await useFetch('/api/commerce/wishes/mine', {
    key: 'wishes-mine',
    default: () => ({ received: [], purchased: [] }),
  })
  const signedIn = computed(() => mineError.value?.status !== 401)
  const yourWishes = computed(() => mine.value?.received ?? [])
  const purchasedWishes = computed(() => mine.value?.purchased ?? [])

  const STATE_COLORS = { available: 'success', pending: 'info', used: 'grey', redeemed: 'grey', expired: 'error' }
  const money = (amount) => (amount == null ? '' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount))
  const date = (value) => new Date(String(value).replace(' ', 'T')).toLocaleDateString()

  useHead({
    title: computed(() => wishBar?.value?.name || 'Wishes')
  })
</script>

<style scoped>
  .wishes__code {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    letter-spacing: 0.05em;
    word-break: break-all;
  }
</style>