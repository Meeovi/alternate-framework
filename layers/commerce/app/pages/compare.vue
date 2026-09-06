<template>
    <div class="contentPage">
        <v-toolbar flat color="surface">
            <v-toolbar-title>Compare Products</v-toolbar-title>
            <v-btn v-if="comparedProducts?.length" variant="text" @click="compareStore.clearComparedProductSkus()">
                Clear all
            </v-btn>
        </v-toolbar>

        <compare v-if="comparedProducts?.length" :products="comparedProducts" />

        <div v-else class="pa-8 text-center">
            <p>You haven't added any products to compare yet.</p>
            <v-btn color="primary" to="/">Browse products</v-btn>
        </div>
    </div>
</template>

<script setup>
    import compare from '../components/catalog/product/compare.vue'
    import { useCompareStore } from '../stores/compare'

    const compareStore = useCompareStore()

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    // The compare list is stored client-side as a list of SKUs (see
    // stores/compare.ts) — fetch the real product records for whichever
    // SKUs are currently in it. Mirrors the fields the product detail
    // page's own comparison table already requests successfully.
    const { data: comparedProducts, refresh } = await useAsyncData('comparedProducts', () => {
        const skus = compareStore.getComparedProductSkus
        if (!skus.length) return Promise.resolve([])
        return $directus.request($readItems('products', {
            fields: ['*', 'image.*', 'categories.categories_id.*'],
            filter: {
                sku: { _in: skus }
            }
        }))
    }, {
        watch: [() => compareStore.getComparedProductSkus.join(',')]
    })

    useHead({
        title: 'Compare Products',
    })
</script>
