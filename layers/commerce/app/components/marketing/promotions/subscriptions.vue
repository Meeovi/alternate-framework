<template>
    <div>
        <v-row>
            <v-col cols="12">
                <v-toolbar title="Your Subscriptions" subtitle=""></v-toolbar>
                <v-row class="accountRow">
                    <v-col cols="3" v-for="(subscriptions, index) in mySubscriptions" :key="index">
                        <v-card class="mx-auto" max-width="400">
                            <img loading="lazy" class="align-end text-white" height="200"
                            :src="subscriptions?.image?.filename_disk" :alt="subscriptions?.name" cover />
                                <template #header>{{subscriptions?.name}}</template>
                            <v-card #header class="pt-4">
                                Status: {{ subscriptions?.status }}
                            </v-card>

                            <template #header>
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
                    <v-col cols="3" v-for="(subscriptions, index) in subscriptions" :key="index">
                        <v-card class="mx-auto" max-width="400">
                            <NuxtImg loading="lazy" class="align-end text-white" height="200"
                            :src="subscriptions?.image?.filename_disk" :alt="subscriptions?.name" cover />
                                <template #header>{{subscriptions?.name}}</template>

                            <v-card #header class="pt-4">
                                Status: {{ subscriptions?.status }}
                            </v-card>

                            <template #header>
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


import { useCommerceAdapter, useContentAdapter } from '#imports'
void useCommerceAdapter()
void useContentAdapter()

    import productCard from '~/components/related/post.vue'
    import { computed, unref } from '#imports'
    // BetterAuth `useAuth()` fallback
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const auth: any = (globalThis as any).$useAuth ?? (typeof useAuth !== 'undefined' ? useAuth() : null)
    const user = computed(() => {
        if (!auth) return null
        if (auth.user) return unref(auth.user) || null
        if (auth.session) return unref(auth.session)?.user || null
        return null
    })

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: incentiveBar
    } = await useAsyncData('incentiveBar', async () => {
        const resp = await $directus.request($readItem('navigation', '118', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const {
        data: incentivePage
    } = await useAsyncData('incentivePage', () => {
        return $directus.request($readItem('pages', '86', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: subscriptions
    } = await useAsyncData('subscriptions', async () => {
        const resp = await $directus.request($readItems('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                type: {
                    name: {
                        _eq: 'Subscription'
                    }
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })


    useHead({
        title: 'Subscriptions',
    })

    definePageMeta({
	  middleware: ['authenticated'],
	})
</script>