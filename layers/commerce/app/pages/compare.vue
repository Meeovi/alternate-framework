<template>
    <div class="contentPage">
        <v-toolbar flat color="surface">
            <v-toolbar-title>Compare Products</v-toolbar-title>
            <v-btn v-if="comparedProducts?.length" variant="text" @click="compareStore.clearComparedProductSkus()">
                Clear all
            </v-btn>
        </v-toolbar>

        <!-- The list is in this browser's storage, so it renders here only. -->
        <ClientOnly>
            <compare v-if="comparedProducts?.length" :products="comparedProducts" />

            <div v-else-if="pending || !ready" class="pa-8 text-center">
                <v-progress-circular indeterminate color="primary" />
            </div>

            <div v-else class="pa-8 text-center">
                <p>You haven't added any products to compare yet.</p>
                <v-btn color="primary" to="/">Browse products</v-btn>
            </div>

            <template #fallback>
                <div class="pa-8 text-center">
                    <v-progress-circular indeterminate color="primary" />
                </div>
            </template>
        </ClientOnly>
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
    const { data: comparedProducts, pending, execute } = useAsyncData('comparedProducts', () => {
        const skus = compareStore.getComparedProductSkus
        if (!skus.length) return Promise.resolve([])
        // products.sku is a number (bigint): a text SKU there fails the whole
        // query. Store products mirrored from the commerce backend keep
        // theirs in mageos_sku.
        const numeric = skus.filter((sku) => /^\d{1,18}$/.test(sku))
        const text = skus.filter((sku) => !numeric.includes(sku))
        const anyOf = [
            ...(numeric.length ? [{ sku: { _in: numeric } }] : []),
            ...(text.length ? [{ mageos_sku: { _in: text } }] : []),
        ]
        return $directus.request($readItems('products', {
            fields: ['*', 'image.*', 'categories.categories_id.*'],
            filter: { _and: [{ status: { _eq: 'published' } }, { _or: anyOf }] }
        }))
    }, {
        // The list is in localStorage: on the server it's always empty, and
        // the browser would keep that empty result.
        server: false,
        immediate: false,
        watch: [() => compareStore.getComparedProductSkus.join(',')]
    })

    // The store reads the saved list once Nuxt is ready (stores/compare.ts),
    // so fetch after that; until then "nothing to compare" is only a guess.
    const ready = ref(false)
    onNuxtReady(async () => {
        await execute()
        ready.value = true
    })

    useHead({
        title: 'Compare Products',
    })
</script>
