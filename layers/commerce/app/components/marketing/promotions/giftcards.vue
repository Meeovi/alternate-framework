<template>
    <div>
        <!---->
        <v-row>
            <v-col cols="12">
                <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                    <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[0]?.name }}</h4>
                    <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="products in mycards" :key="products">
                            <productCard :product="products" :class="['ma-4', selectedClass]"
                                @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>
            </v-col>

            <v-col cols="12">
                <v-sheet class="mx-auto sliderProducts row align-items-stretch items-row justify-content-center">
                    <h4 style="left: 15px; position: relative;">{{ callouts?.menus?.[1]?.name }}</h4>
                    <v-slide-group v-model="model" class="pa-4" selected-class="bg-success" show-arrows>
                        <v-slide-group-item v-slot="{ isSelected, toggle, selectedClass }"
                            v-for="products in cards" :key="products">
                            <productCard :product="products" :class="['ma-4', selectedClass]"
                                @click="toggle" />
                            <div class="d-flex fill-height align-center justify-center">
                                <v-scale-transition>
                                    <v-icon v-if="isSelected" color="white" icon="mdi-close-circle-outline"
                                        size="48"></v-icon>
                                </v-scale-transition>
                            </div>
                        </v-slide-group-item>
                    </v-slide-group>
                </v-sheet>
            </v-col>
        </v-row>
    </div>
</template>

<script setup>
    import productCard from '~/components/catalog/product/productCard.vue'
    import {
        ref,
        onMounted,
        computed
    } from 'vue';
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const model = ref(null);
    const userStore = useUserStore()

    const userDisplayName = computed(() => {
        return userStore.name || userStore.username || 'User'
    })

    const { $commerce } = useNuxtApp()
    import { useCatalogFallback } from '../../../composables/useCatalog'
    const catalog = useCatalogFallback()

    const {
        data: cards
    } = await useAsyncData('cards', async () => {
        return await catalog.listProducts({
            fields: ['*', 'image.*', 'currency.currency_id.*'],
            filter: { product_types: { product_types_id: { name: { _eq: 'Gift Card' } } } }
        })
    })

    const {
        data: mycards
    } = await useAsyncData('mycards', async () => {
        // user-specific filtering may not map directly to adapters; fall back handled by composable
        return await catalog.listProducts({
            fields: ['*', 'image.*', 'currency.currency_id.*'],
            filter: { product_types: { product_types_id: { name: { _eq: 'Gift Card' } } }, user: { directus_users: { _eq: `${userDisplayName.user.displayName}` } } }
        })
    })

    const {
        data: callouts
    } = await useAsyncData('callouts', async () => {
        // callouts remain stored in Directus; use Nuxt runtime for these CMS pieces
        const nuxtApp = useNuxtApp() as any
        return nuxtApp.$directus ? await nuxtApp.$directus.request(nuxtApp.$readItem('callouts', '4')) : null
    })

    useHead({
        title: 'Gift Cards',
    })

    definePageMeta({
        middleware: ['authenticated'],
    })
</script>