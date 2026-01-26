<template>
    <div>
        <v-card elevation="0" style="min-height: 100vh !important;">
            <v-layout>
                <v-main>
                    <v-tabs center-active v-model="tab" bg-color="transparent">
                        <div v-for="(menu, index) in dealbar?.menus" :key="index">
                    <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
                </div>
                    </v-tabs>

                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item :value="dealbar?.menus[0]?.value">
                                <v-row>
                                    <v-col cols="3" v-for="products in dealsProducts" :key="products">
                                        <productCard :product="products" />
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>

                            <v-tabs-window-item :value="dealbar?.menus[1]?.value">
                                <v-row>
                                    <v-col cols="3" v-for="products in dollar" :key="products">
                                        <productCard :product="products" />
                                    </v-col>
                                </v-row>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-card-text>
                </v-main>
            </v-layout>
        </v-card>
    </div>
</template>

<script setup>
    import {
        ref
    } from 'vue'
    import productCard from '#commerce/app/components/catalog/product/productCard.vue'


    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const {
        data: dealbar
    } = await useAsyncData('dealbar', () => {
        return $directus.request($readItem('navigation', '49', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: dealsProducts
    } = await useAsyncData('dealsProducts', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                price: {
                    _lte: 20
                }
            }
        }))
    })

    const {
        data: dollar
    } = await useAsyncData('dollar', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                price: {
                    _lte: 1
                }
            }
        }))
    })    

    const tab = ref(null)
    const props = defineProps({
        category: {
            type: Number,
            required: true,
        },
    });

    useHead({
        title: 'Deals',
    })
</script>