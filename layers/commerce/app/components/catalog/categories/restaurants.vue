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
                            <v-tabs-window-item :value="restaurantbar?.menus?.[0]?.value">
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

    // product_types is a M2M relation (products -> product_types via
    // product_types_id, an integer FK) — filtering product_types_id
    // directly against a string name is an int-vs-string mismatch Directus
    // rejects outright. `status` values are lowercase, confirmed against
    // the live field's choices. NOTE: 'Restaurant' also isn't a real
    // product_types name in the live vocabulary (checked) — this stays
    // empty by design rather than guessing at a type that doesn't exist.
    const {
        data: restaurants
    } = await useAsyncData('restaurants', () => {
        return $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                status: {
                    _eq: 'published'
                },
                product_types: {
                    product_types_id: {
                        name: { _eq: 'Restaurant' }
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