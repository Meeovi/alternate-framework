<template>
    <div>
        <v-toolbar flat color="white">
            <v-toolbar-title>Digital Content and Devices</v-toolbar-title>
        </v-toolbar>

        <v-row>
            <v-col cols="4">
                <v-card append-icon="fas fa-up-right-from-square" class="mx-auto" href="/lists"
                    max-width="344" prepend-icon="fas fa-list" rel="noopener"
                    subtitle="Manage your Lists" target="_blank" title="Lists"></v-card>
            </v-col>

            <v-col cols="4">
                <v-card append-icon="fas fa-up-right-from-square" class="mx-auto" href="/product/downloads"
                    max-width="344" prepend-icon="fas fa-download" rel="noopener"
                    subtitle="Manage your Downloads" target="_blank" title="Downloads"></v-card>
            </v-col>

            <v-col cols="4">
                <v-card append-icon="fas fa-up-right-from-square" class="mx-auto" href="/product/collections"
                    max-width="344" prepend-icon="fas fa-folder" rel="noopener"
                    subtitle="Manage your Collections" target="_blank" title="Collections"></v-card>
            </v-col>

            <v-col cols="4">
                <v-card append-icon="fas fa-up-right-from-square" class="mx-auto" href="/media-library"
                    max-width="344" prepend-icon="fas fa-camera" rel="noopener"
                    subtitle="Manage your Media" target="_blank" title="Media Library"></v-card>
            </v-col>            
        </v-row>

        <!-- Digital Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="digitalProducts?.length">
            <v-toolbar title="Digital Products" color="transparent"></v-toolbar>

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

        <!-- Devices Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="devices?.length">
            <v-toolbar title="Purchased Meeovi Devices" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in devices"
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

        <!-- App Type Products Section (commerce) -->
        <v-sheet style="background-color: transparent; box-shadow: none;" v-if="apps?.length">
            <v-toolbar title="Purchased Apps" color="transparent"></v-toolbar>

            <v-slide-group class="pa-4" selected-class="bg-success" show-arrows>
                <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }" v-for="product in apps"
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
    </div>
</template>

<script setup>
    import {
        useHead
    } from 'nuxt/app';
    import productCard from '#commerce/app/components/catalog/product/productCard.vue'

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const {
        data: digitalProducts
    } = await useAsyncData('digitalProducts', () => {
        return $directus.request($readItem('products'))
    })

    const {
        data: devices
    } = await useAsyncData('devices', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'Devices'
                }
            }
        }))
    })

    const {
        data: apps
    } = await useAsyncData('apps', () => {
        return $directus.request($readItem('products', {
            filter: {
                type: {
                    _eq: 'App'
                }
            }
        }))
    })

    useHead({
        title: 'Digital Content and Devices',
        meta: [{
            name: 'description',
            content: 'Manage your speed dial settings'
        }]
    })
</script>