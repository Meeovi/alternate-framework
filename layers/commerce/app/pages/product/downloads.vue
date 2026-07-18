<template>
    <div class="contentPage">
        <v-toolbar flat color="white">
            <v-toolbar-title>Your Downloads</v-toolbar-title>
        </v-toolbar>

        <!-- Book Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="books?.length">
            <v-toolbar title="Your eBooks and Comics" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in books"
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
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="games?.length">
            <v-toolbar title="Purchased Games" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in games"
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
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="moviesTv?.length">
            <v-toolbar title="Purchased Movies and TV Shows" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in moviesTv"
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
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="music?.length">
            <v-toolbar title="Purchased Music" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in music"
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

        <!-- Image Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="images?.length">
            <v-toolbar title="Purchased Images" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in images"
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

        <!-- Podcasts Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="podcasts?.length">
            <v-toolbar title="Purchased Podcasts" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in podcasts"
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

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: books
    } = await useAsyncData('books', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Book'
                }
            }
        }))
    })

    const {
        data: games
    } = await useAsyncData('games', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Game'
                }
            }
        }))
    })

    const {
        data: moviesTv
    } = await useAsyncData('moviesTv', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Video'
                }
            }
        }))
    })

    const {
        data: music
    } = await useAsyncData('music', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Music'
                }
            }
        }))
    })

    const {
        data: images
    } = await useAsyncData('images', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Image'
                }
            }
        }))
    })

    const {
        data: podcasts
    } = await useAsyncData('podcasts', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Podcast'
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