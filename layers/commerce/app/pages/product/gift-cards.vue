<template>
    <div class="contentPage">
        <v-toolbar flat color="white">
            <v-toolbar-title>Gift Cards Center</v-toolbar-title>
        </v-toolbar>

        <!-- Gift Card Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="giftCards.length">
            <v-toolbar title="Gift Cards" color="transparent"></v-toolbar>
            <!-- The cart refuses gift cards (server/utils/cart.ts) until
                 checkout can take the amount and recipient. -->
            <v-alert type="info" variant="tonal" class="mx-4" density="compact">
                Gift cards can't be bought here yet. You can still see and use the ones you've received.
            </v-alert>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in giftCards"
                    :key="product.id">
                    <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                    <div class="d-flex fill-height align-center justify-center">
                        <v-scale-transition>
                            <v-icon v-if="isSelected" color="white" icon="fas fa-circle-xmark" size="48"></v-icon>
                        </v-scale-transition>
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <!-- Received Gift Cards Section (sent to the user's verified email) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="receivedGiftCards.length">
            <v-toolbar title="Your Gift Cards" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" show-arrows>
                <v-slide-group-item v-for="(card, i) in receivedGiftCards" :key="`r-${i}`">
                    <v-card variant="outlined" class="ma-4 giftCards__card">
                        <v-card-item>
                            <v-card-title>{{ money(card.balance) }}</v-card-title>
                            <v-card-subtitle>{{ card.sender_name ? `From ${card.sender_name}` : 'Gift card' }}</v-card-subtitle>
                        </v-card-item>
                        <v-card-text>
                            <div class="giftCards__code">{{ card.code }}</div>
                            <p v-if="card.message" class="mt-2">{{ card.message }}</p>
                            <div class="d-flex flex-wrap ga-2 mt-3">
                                <v-chip size="small" variant="tonal" :color="STATE_COLORS[card.state]" :text="card.state" />
                                <v-chip v-if="card.expires_at" size="small" variant="tonal" :text="`Expires ${date(card.expires_at)}`" />
                            </div>
                        </v-card-text>
                    </v-card>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <!-- Purchased Gift Cards Section (on the user's orders) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="purchasedGiftCards.length">
            <v-toolbar title="Purchased Gift Cards" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" show-arrows>
                <v-slide-group-item v-for="(card, i) in purchasedGiftCards" :key="`p-${i}`">
                    <v-card variant="outlined" class="ma-4 giftCards__card">
                        <v-card-item>
                            <v-card-title>{{ card.product_name || 'Gift card' }}</v-card-title>
                            <v-card-subtitle>
                                {{ card.recipient_name || card.recipient_email ? `For ${card.recipient_name || card.recipient_email}` : 'For you' }}
                            </v-card-subtitle>
                        </v-card-item>
                        <v-card-text>
                            <div class="giftCards__code">{{ card.code || card.masked_code || 'Code on its way' }}</div>
                            <div class="d-flex flex-wrap ga-2 mt-3">
                                <v-chip size="small" variant="tonal" :color="STATE_COLORS[card.state]" :text="card.state" />
                                <v-chip v-if="card.balance != null" size="small" variant="tonal" :text="money(card.balance)" />
                                <v-chip v-if="card.order_number" size="small" variant="tonal" :text="`Order ${card.order_number}`" />
                            </div>
                        </v-card-text>
                    </v-card>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <div class="center-text" v-if="!giftCards.length && !receivedGiftCards.length && !purchasedGiftCards.length">
            {{ signedIn ? 'No gift cards yet' : 'No gift cards yet. Sign in to see the gift cards you\'ve received or bought.' }}
        </div>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { useHead } from 'nuxt/app';
    import productCard from '../../components/catalog/product/productCard.vue'

    // Gift card products from the commerce backends that sell them
    // (server/api/commerce/wishes/products) — never Directus.
    const { data: products } = await useFetch('/api/commerce/wishes/products', {
        key: 'gift-cards-products',
        default: () => ({ products: [] }),
    })
    const giftCards = computed(() => products.value?.products ?? [])

    // The signed-in user's own gift cards, received + purchased
    // (server/api/commerce/wishes/mine). 401 when signed out.
    const { data: mine, error: mineError } = await useFetch('/api/commerce/wishes/mine', {
        key: 'gift-cards-mine',
        default: () => ({ received: [], purchased: [] }),
    })
    const signedIn = computed(() => mineError.value?.status !== 401)
    const receivedGiftCards = computed(() => mine.value?.received ?? [])
    const purchasedGiftCards = computed(() => mine.value?.purchased ?? [])

    const STATE_COLORS = { available: 'success', pending: 'info', used: 'grey', redeemed: 'grey', expired: 'error' }
    const money = (amount) => (amount == null ? '' : new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(amount))
    const date = (value) => new Date(String(value).replace(' ', 'T')).toLocaleDateString()

    useHead({
        title: 'Gift Card Center',
        meta: [{
            name: 'description',
            content: 'Gift Card shop'
        }]
    })
</script>

<style scoped>
    .giftCards__card {
        width: 280px;
    }

    .giftCards__code {
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.05em;
        word-break: break-all;
    }
</style>
