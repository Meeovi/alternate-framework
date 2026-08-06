<template>
    <div>
        <v-toolbar :color="friendPurchasesBar?.color">
            <v-toolbar-title>{{ friendPurchasesBar?.name }}</v-toolbar-title>

            <v-toolbar-items>

            </v-toolbar-items>
        </v-toolbar>

        <v-row>
            <v-col cols="4" v-for="(product, index) in friendsProducts" :key="index">
                <productCard :product="product" />
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import {
        productCard
    } from '../components/catalog/product/productCard.vue'

    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

    const {
        data: friendsProducts
    } = await useAsyncData('friendsProducts', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            users: {
                follow: {
                    status: {
                        _eq: true
                    }
                }
            }
        }))
    })

    const {
        data: friendPurchasesBar
    } = await useAsyncData('friendPurchasesBar', () => {
        return $directus.request($readItem('navigation', '126', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

  useHead({
    title: computed(() => friendPurchasesBar?.value?.name || 'Friend Purchases Page')
  })
</script>