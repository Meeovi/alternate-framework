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
        onMounted
    } from 'vue';
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const model = ref(null);
    const userStore = useUserStore()

    const userDisplayName = computed(() => {
        return userStore.name || userStore.username || 'User'
    })

    const {
        $directus,
        $readItems,
        $readItem
    } = useNuxtApp()

    const {
        data: cards
    } = await useAsyncData('cards', () => {
        return $directus.request($readItems('products', {
            fields: ['*',
                'image.*',
                'currency.currency_id.*'
            ],
            filter: {
                product_types: {
                    product_types_id: {
                        name: {
                            _eq: "Gift Card"
                        }
                    }
                }
            }
        }))
    })

    const {
        data: mycards
    } = await useAsyncData('mycards', () => {
        return $directus.request($readItems('products', {
            fields: ['*',
                'image.*',
                'currency.currency_id.*'
            ],
            filter: {
                product_types: {
                    product_types_id: {
                        name: {
                            _eq: "Gift Card"
                        }
                    }
                },
                user: {
                    directus_users: {
                        _eq: `${userDisplayName.user.displayName}`
                    }
                }
            }
        }))
    })

    const {
        data: callouts
    } = await useAsyncData('callouts', () => {
        return $directus.request($readItem('callouts', '4'))
    })

    useHead({
        title: 'Gift Cards',
    })

    definePageMeta({
        middleware: ['authenticated'],
    })
</script>