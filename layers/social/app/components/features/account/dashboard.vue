<template>
    <div class="contentPage">
        <UCard>
            <v-layout>
                <v-toolbar color="primary">
                    <v-toolbar-title>{{ page?.name }}</v-toolbar-title>
                    <v-toolbar-items>
                        <UButton prepend-icon="fas:fa fa-th" color="white" @click.stop="drawer = !drawer">
                            {{ customerInfo?.firstname }} {{ customerInfo?.lastname }}
                        </UButton>
                    </v-toolbar-items>
                </v-toolbar>

                <div class="d-flex flex-row">
                    <v-navigation-drawer v-model="drawer" temporary>
                        <v-tabs v-model="tab" color="primary" direction="vertical">
                            <v-tab value="orders">Orders</v-tab>
                            <v-tab value="addresses">Addresses</v-tab>
                            <v-tab value="settings">Account Settings</v-tab>
                            <v-tab value="downloads">Downloads</v-tab>
                            <v-tab value="reviews">Reviews</v-tab>
                        </v-tabs>
                    </v-navigation-drawer>

                    <v-main style="height: 100vh">
                        <v-tabs-window v-model="tab" style="width: 100%;">
                            <v-tabs-window-item value="orders">
                                <UCard flat>
                                    <template #header>
                                        <orders />
                                    </template>
                                </UCard>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="addresses">
                                <UCard flat>
                                    <template #header>
                                        <addresses />
                                    </template>
                                </UCard>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="settings">
                                <UCard flat>
                                    <template #header>
                                        <settings />
                                    </template>
                                </UCard>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="downloads">
                                <UCard flat>
                                    <template #header>
                                        <downloads />
                                    </template>
                                </UCard>
                            </v-tabs-window-item>

                            <v-tabs-window-item value="reviews">
                                <UCard flat>
                                    <template #header>
                                        <reviews />
                                    </template>
                                </UCard>
                            </v-tabs-window-item>
                        </v-tabs-window>
                    </v-main>
                </div>
            </v-layout>
        </UCard>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import orders from '#commerce/app/components/orders/orders/my-orders.vue'
import addresses from '~/components/account/addresses.vue'
import settings from '~/components/account/settings.vue'
import downloads from '~/components/account/downloads.vue'
import reviews from '~/components/account/reviews.vue'
import { useMagentoApi } from '#commerce/app/composables/useMagentoApi'

const tab = ref('orders')
const drawer = ref(null)
const customerInfo = ref(null)
const { getCustomerInfo } = useMagentoApi()

onMounted(async () => {
    try {
        customerInfo.value = await getCustomerInfo()
    } catch (error) {
        console.error('Failed to fetch customer info:', error)
    }
})

definePageMeta({
    layout: 'nolive',
    middleware: ['authenticated'],
})

useHead({
    title: "Account Dashboard"
})
</script>