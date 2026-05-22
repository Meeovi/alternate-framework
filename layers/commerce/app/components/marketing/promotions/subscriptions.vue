<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-toolbar title="Your Subscriptions" subtitle=""></v-toolbar>
                <v-row class="accountRow">
                    <v-col cols="3" v-for="(subscriptions, index) in allSubscriptions" :key="index">
                        <v-card class="mx-auto" max-width="400">
                            <img loading="lazy" class="align-end text-white" height="200"
                            :src="getAssetUrl(subscriptions?.image)" :alt="subscriptions?.name" cover />
                                <template>{{subscriptions?.name}}</template>
                            <v-card class="pt-4">
                                Status: {{ subscriptions?.status }}
                            </v-card>

                            <template>
                                <div>Start Date: {{ subscriptions?.start_date }}</div>

                                <div>End Date: {{ subscriptions?.end_date }}</div>
                            </template>

                            <template>
                                <v-btn color="red" :href="`/commerce/subscriptions/${subscriptions?.id}`">
                                    Manage subscription
                                </v-btn>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>

            <v-col cols="12">
                <v-toolbar title="Available Subscriptions" subtitle=""></v-toolbar>
                <v-row class="accountRow">
                    <v-col cols="3" v-for="(subscriptions, index) in allSubscriptions" :key="index">
                        <v-card class="mx-auto" max-width="400">
                            <NuxtImg loading="lazy" class="align-end text-white" height="200"
                            :src="getAssetUrl(subscriptions?.image)" :alt="subscriptions?.name" cover />
                                <template>{{subscriptions?.name}}</template>

                            <v-card class="pt-4">
                                Status: {{ subscriptions?.status }}
                            </v-card>

                            <template>
                                <div>Start Date: {{ subscriptions?.start_date }}</div>

                                <div>End Date: {{ subscriptions?.end_date }}</div>
                            </template>

                            <template>
                                <v-btn color="red">
                                    Add to Cart
                                </v-btn>
                            </template>
                        </v-card>
                    </v-col>
                </v-row>
            </v-col>
        </v-row>
    </div>
</template>

<script setup lang="ts">
import productCard from '../../catalog/product/productCard.vue'
import { computed, ref } from 'vue'
import { useAuth } from '../../../composables/globals/useAuth'

const auth = useAuth()
const user = computed(() => (auth as any)?.user?.value || null)
const userId = computed(() => user.value?.id || null)

const tab = ref(null)
const content = useSdkContentAdapter()
const { getAssetUrl } = content

const { data: incentiveBar } = await useAsyncData('incentiveBar', async () => {
    return content.readItem('navigation', '118', { fields: ['*', { '*': ['*'] }] })
})

const { data: incentivePage } = await useAsyncData('incentivePage', async () => {
    return content.readItem('pages', '86', { fields: ['*', { '*': ['*'] }] })
})

const { data: allSubscriptions } = await useAsyncData('allSubscriptions', async () => {
    const resp = await content.readItems('products', {
        fields: ['*', { '*': ['*'] }],
        filter: {
            user_id: {
                _eq: userId.value
            },
            type: {
                name: {
                    _eq: 'Subscription'
                }
            }
        }
    })
    return (resp as any)?.data ?? (resp as any) ?? []
})


    useHead({
        title: 'Subscriptions',
    })

</script>