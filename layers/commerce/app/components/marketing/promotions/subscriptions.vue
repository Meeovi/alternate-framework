<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-toolbar title="Your Subscriptions" subtitle=""></v-toolbar>
                <v-row class="accountRow">
                    <v-col cols="3" v-for="(subscriptions, index) in allSubscriptions" :key="index">
                        <v-card class="mx-auto" max-width="400">
                            <NuxtImg provider="cloudinary" loading="lazy" class="align-end text-white" height="200"
                            :src="getAssetURL(subscriptions?.image) ?? undefined" :alt="subscriptions?.name" cover />
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
                            :src="getAssetURL(subscriptions?.image) ?? undefined" :alt="subscriptions?.name" cover />
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
import { ref } from '#imports'
import { getAssetURL } from '#shared/app/utils/get-asset-url'

  const {
    $directus,
    $readItems
  } = useNuxtApp() as any

  const tab = ref(null)

  // NOTE: like product/downloads.vue, this isn't yet scoped to what the
  // signed-in user actually purchased — there is no established link from
  // an order back to a per-user "owned subscriptions" list in this app.
  // Both sections below list every Subscription-type product until that
  // exists.
  const { data: allSubscriptions } = await useAsyncData('allSubscriptions', async () => {
    const resp = await $directus.request($readItems('products', {
        fields: ['*', 'image.*'],
        filter: {
            product_types: {
                product_types_id: {
                    name: {
                        _eq: 'Subscription'
                    }
                }
            }
        }
    }))
    return (resp as any)?.data ?? (resp as any) ?? []
})


    useHead({
        title: 'Subscriptions',
    })

</script>