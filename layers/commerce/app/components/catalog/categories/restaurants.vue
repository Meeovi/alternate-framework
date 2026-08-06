<template>
    <div>
        <v-card elevation="0" style="min-height: 100vh !important;">
            <v-layout>
                <v-main>
                    <v-tabs center-active v-model="tab" :style="`background-color: ${restaurantbar?.color}; color: ${restaurantbar?.colorText}`">
                        <div v-for="(menu, index) in restaurantbar?.menus" :key="index">
                    <v-tab :value="menu?.value">{{ menu?.name }}</v-tab>
                </div>
                    </v-tabs>

                    <v-card-text>
                        <v-tabs-window v-model="tab">
                            <v-tabs-window-item :value="restaurantbar?.menus[0]?.value">
                                <v-row>
                                    <v-col cols="3" v-for="products in restaurants" :key="products">
                                        <restaurantCard :product="products" />
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
    import restaurantCard from '../../related/restaurantCard.vue'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()

    const {
        data: restaurantbar
    } = await useAsyncData('restaurantbar', () => {
        return $directus.request($readItem('navigation', '128', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: restaurants
    } = await useAsyncData('restaurants', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                status: {
                    _eq: 'Published'
                },
                product_types: {
                    product_types_id: {
                        _eq: 'Restaurant'
                    }
                }
            }
        }))
    })

    const tab = ref(null)
    const props = defineProps({
        category: {
            type: String,
            required: true,
        },
    });
</script>