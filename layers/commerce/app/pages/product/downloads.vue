<template>
    <div class="contentPage">
        <v-toolbar flat color="white">
            <v-toolbar-title>Your Downloads</v-toolbar-title>
        </v-toolbar>

        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="digitalProducts?.length">
            <v-toolbar title="Digital Purchases" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in digitalProducts"
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

        <p v-else class="pa-4">No digital downloads yet.</p>
    </div>
</template>

<script setup>
    import {
        useHead
    } from 'nuxt/app';
    import productCard from '../../components/catalog/product/productCard.vue'

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    // NOTE: `products.type` doesn't exist as a field, and the real
    // `product_types` M2M vocabulary has no Book/Game/Video/Music/Image/
    // Podcast breakdown fine-grained enough to sort into, and is sparsely
    // populated on real rows besides — the six-section version of this
    // page (previously filtering on that nonexistent field) always
    // returned nothing for any of them. `products.file` being set is the
    // same real fulfillment signal server/api/payment/stripe/webhooks.post
    // .ts uses to decide an order is digitally deliverable, so this lists
    // by that instead of a fictional category breakdown.
    //
    // This also isn't yet scoped to what the signed-in user actually
    // purchased (there is no established link from an order's line items
    // back to a per-user "owned products" list in this app yet). Until
    // that exists, this page shows every published digital product, not a
    // personal library.
    const {
        data: digitalProducts
    } = await useAsyncData('digitalProducts', () => {
        return $directus.request($readItems('products', {
            filter: {
                file: {
                    _nnull: true
                }
            }
        }))
    })

    useHead({
        title: 'Your Downloads',
        meta: [{
            name: 'description',
            content: 'Manage your downloads'
        }]
    })
</script>
