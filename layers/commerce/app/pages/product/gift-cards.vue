<template>
    <div class="contentPage">
        <v-toolbar flat color="white">
            <v-toolbar-title>Gift Cards Center</v-toolbar-title>
        </v-toolbar>

        <!-- Gift Card Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="giftCards?.length">
            <v-toolbar title="Your Gift Cards" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in giftCards"
                    :key="product.id">
                    <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                    <div class="d-flex fill-height align-center justify-center">
                        <v-scale-transition>
                            <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                        </v-scale-transition>
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <!-- Devices Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="meeGiftCards?.length">
            <v-toolbar title="Meeovi branded Gift Cards" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in meeGiftCards"
                    :key="product.id">
                    <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                    <div class="d-flex fill-height align-center justify-center">
                        <v-scale-transition>
                            <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                        </v-scale-transition>
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <!-- App Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="myGiftCards?.length">
            <v-toolbar title="Purchased Gift Cards" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in myGiftCards"
                    :key="product.id">
                    <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                    <div class="d-flex fill-height align-center justify-center">
                        <v-scale-transition>
                            <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                        </v-scale-transition>
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>

        <!-- Music Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="giftCertificates?.length">
            <v-toolbar title="Purchased Music" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in giftCertificates"
                    :key="product.id">
                    <productCard :product="product" :class="['ma-4', selectedClass]" @click="toggle" />
                    <div class="d-flex fill-height align-center justify-center">
                        <v-scale-transition>
                            <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline" size="48"></v-icon>
                        </v-scale-transition>
                    </div>
                </v-slide-group-item>
            </v-slide-group>
        </v-sheet>
    </div>
</template>

<script setup>
    import {
        useHead
    } from 'nuxt/app';
    import productCard from '../../components/catalog/product/productCard.vue'
    import { useAuth } from '#auth/app/composables/useAuth'

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()

    const {
        data: giftCards
    } = await useAsyncData('giftCards', () => {
        return $directus.request($readItems('products', {
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Gift Card'
                    }
                }
            }
        }))
    })

    const {
        data: meeGiftCards
    } = await useAsyncData('meeGiftCards', () => {
        return $directus.request($readItems('products', {
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Gift Card'
                    }
                },
                user: {
                    directus_users: {
                        _eq: 'Meeovi'
                    }
                }
            }
        }))
    })

    const {
        data: myGiftCards
    } = await useAsyncData('myGiftCards', () => {
        if (!session?.user?.username) return []
        return $directus.request($readItems('products', {
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Gift Card'
                    }
                },
                user: {
                    directus_users: {
                        _eq: session.user.username
                    }
                }
            }
        }))
    })

    const {
        data: giftCertificates
    } = await useAsyncData('giftCertificates', () => {
        return $directus.request($readItems('products', {
            filter: {
                product_types: {
                    product_types_id: {
                        _eq: 'Gift Certificate'
                    }
                }
            }
        }))
    })

    useHead({
        title: 'Gift Card Center',
        meta: [{
            name: 'description',
            content: 'Gift Card shop'
        }]
    })
</script>