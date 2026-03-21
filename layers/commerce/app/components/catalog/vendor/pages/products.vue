<template>
    <v-card>
        <v-toolbar color="" title="Products">
            <addproduct />
        </v-toolbar>
        <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="one">My Products</v-tab>
        </v-tabs>
        <template #header>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                    <div v-if="products.length">
                        <productCard v-for="product in products" :key="product.id" :product="product" />
                    </div>
                    <div v-else>No products found.</div>
                </v-tabs-window-item>
            </v-tabs-window>
        </template>
    </v-card>
</template>


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

    import {
        ref,
        onMounted
    } from '#imports';
    import {
        useVendureQuery
    } from '@/app/composables/useVendureQuery';
    import getProductListQuery from '#graphql/app/commerce/queries/getProductList.gql';
    import addproduct from '~/components/crud/create/add-product.vue';
    import productCard from '~/components/productCard.vue';

    const tab = ref('one');
    const products = ref([]);
    const {
        data,
        refetch
    } = useVendureQuery(getProductListQuery);

    onMounted(() => {
        if (data.value?.products?.items) {
            products.value = data.value.products.items;
        }
    });

    definePageMeta({
        layout: 'sellers',
        middleware: ['authenticated'],
    });

    useHead({
        title: 'Sellers Products',
    });
</script>