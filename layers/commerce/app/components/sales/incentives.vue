<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ incentivePage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="incentivePage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar
                :style="`background-color: ${incentiveBar?.color}; color: ${incentiveBar?.colortext} !important`">
                <v-toolbar-title>{{ incentiveBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in incentiveBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${incentiveBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            const tab = ref(null);

            const nuxtApp = useNuxtApp();
            const $gateway = nuxtApp.$gateway;
            const read = (nuxtApp.read as any);
            // Fallback for currentUserId
            const currentUserId = null;

            const { data: incentiveBar } = await useAsyncData('incentiveBar', async () => {
                const resp = await $gateway?.content?.(read('navigation', '118', {
                    fields: ['*', { '*': ['*'] }]
                }))
                return resp?.data ?? resp ?? null
            })

            const { data: incentivePage } = await useAsyncData('incentivePage', () => {
                return $gateway?.content?.(read('pages', '86', {
                    fields: ['*', { '*': ['*'] }]
                }))
            })

            const { data: coupons } = await useAsyncData('coupons', async () => {
                if (!currentUserId) return []
                const resp = await $gateway?.content?.(read('incentives', {
                    fields: ['*', { '*': ['*'] }],
                    filter: {
                        user_id: { _eq: currentUserId },
                        incentive_type: { name: { _eq: 'Coupon' } }
                    }
                }))
                return resp?.data ?? resp ?? []
                <v-row class="media-container-row">
            const { data: rewards } = await useAsyncData('rewards', async () => {
                if (!currentUserId) return []
                const resp = await $gateway?.content?.(read('incentives', {
                    fields: ['*', { '*': ['*'] }],
                    filter: {
                        user_id: { _eq: currentUserId },
                        incentive_type: { name: { _eq: 'Reward' } }
                    }
                }))
                return resp?.data ?? resp ?? []
            })
    </div>
</template>

<script setup lang="ts">

    import {
        ref,
        computed
    } from '#imports'
    import incentiveCard from '~/components/related/post.vue'

    // @ts-ignore - useAuth may not be globally available
    // import { useAuth } from '#auth/app/composables/useAuth'
    // const { user, fetchSession } = useAuth()
    // await fetchSession()
    // const getCurrentUserId = () => (user.value && (user.value.id || user.value.userId)) || null
    // const currentUserId = getCurrentUserId()

    const nuxtApp = useNuxtApp();
    const $gateway = nuxtApp.$gateway as any;
    const read = nuxtApp.read as any;
    const tab = ref(null);
    const currentUserId = null; // fallback

    const { data: incentiveBar } = await useAsyncData<any>('incentiveBar', async () => {
        const resp = await $gateway.content?.(read('navigation', '118', {
            fields: ['*', { '*': ['*'] }]
        }))
        return resp?.data ?? resp ?? null
    })

    const { data: incentivePage } = await useAsyncData<any>('incentivePage', () => {
        return $gateway.content?.(read('pages', '86', {
            fields: ['*', { '*': ['*'] }]
        }))
    })

    const { data: coupons } = await useAsyncData<any>('coupons', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content?.(read('incentives', {
            fields: ['*', { '*': ['*'] }],
            filter: {
                user_id: { _eq: currentUserId },
                incentive_type: { name: { _eq: 'Coupon' } }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    const { data: rewards } = await useAsyncData<any>('rewards', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content?.(read('incentives', {
            fields: ['*', { '*': ['*'] }],
            filter: {
                user_id: { _eq: currentUserId },
                incentive_type: { name: { _eq: 'Reward' } }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: creditMemos
    } = await useAsyncData('creditMemos', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content(read('incentives', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: currentUserId
                },
                incentive_type: {
                    name: {
                        _eq: 'Credit Memo'
                    }
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: giftCards
    } = await useAsyncData('giftCards', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content(read('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: currentUserId
                },                
                incentive_type: {
                    name: {
                        _eq: 'Gift Card'
                    }
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: certificates
    } = await useAsyncData('certificates', async () => {
        if (!currentUserId) return []
        const resp = await $gateway.content(read('products', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: currentUserId
                },
                incentive_type: {
                    name: {
                        _eq: 'Gift Certificate'
                    }
                }
            }
        }))
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: 'Incentives',
    })
</script>