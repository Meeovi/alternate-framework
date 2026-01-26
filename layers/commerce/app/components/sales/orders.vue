<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ ordersPage?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="ordersPage?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${orderBar?.color}; color: ${orderBar?.colortext} !important`">
                <v-toolbar-title>{{ orderBar?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in orderBar?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${orderBar?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <!--Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="orders?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="order in orders" :key="order.id">
                            <orderCard :order="order" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>

            <!--Pending Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[1]?.value">
                <v-row class="media-container-row">
                    <template v-if="pending?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="pendingOrder in pending"
                            :key="pendingOrder.id">
                            <orderCard :order="pendingOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Pending Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Processing Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <template v-if="processing?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="processingOrder in processing"
                            :key="processingOrder.id">
                            <orderCard :order="processingOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Processing Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--On Hold Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="onHold?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="onHoldOrder in onHold"
                            :key="onHoldOrder.id">
                            <orderCard :order="onHoldOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No On Hold Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Failed Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[4]?.value">
                <v-row class="media-container-row">
                    <template v-if="failed?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="failedOrder in failed"
                            :key="failedOrder.id">
                            <orderCard :order="failedOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Failed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Disputed Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <template v-if="disputed?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="disputedOrder in disputed"
                            :key="disputedOrder.id">
                            <orderCard :order="disputedOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Disputed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Completed Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[5]?.value">
                <v-row class="media-container-row">
                    <template v-if="completed?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="completedOrder in completed"
                            :key="completedOrder.id">
                            <orderCard :order="completedOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Completed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Refunded Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[4]?.value">
                <v-row class="media-container-row">
                    <template v-if="refunded?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="refundedOrder in refunded"
                            :key="refundedOrder.id">
                            <orderCard :order="refundedOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Refunded Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Cancelled Orders-->
            <v-tabs-window-item :value="orderBar?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <template v-if="cancelled?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="cancelOrder in cancelled"
                            :key="cancelOrder.id">
                            <orderCard :order="cancelOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Cancelled Orders</div>
                </v-row>
            </v-tabs-window-item>
        </v-tabs-window>
    </div>
</template>

<script setup>
    import {
        ref,
        computed
    } from 'vue'
    import orderCard from '~/components/related/order.vue'
    import {
        useUserStore
    } from '#auth/app/stores/user'

    const user = useSupabaseUser()

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp()
    const tab = ref(null);

    const {
        data: orderBar
    } = await useAsyncData('orderBar', async () => {
        const resp = await $directus.request($readItem('navigation', '84', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
        return resp?.data ?? resp ?? null
    })

    const {
        data: ordersPage
    } = await useAsyncData('ordersPage', () => {
        return $directus.request($readItem('pages', '86', {
            fields: ['*', {
                '*': ['*']
            }]
        }))
    })

    const {
        data: orders
    } = await useAsyncData('orders', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: pending
    } = await useAsyncData('pending', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'pending'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: processing
    } = await useAsyncData('processing', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'processing'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: onHold
    } = await useAsyncData('onHold', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'on-hold'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: failed
    } = await useAsyncData('failed', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'failed'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: disputed
    } = await useAsyncData('disputed', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'disputed'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: completed
    } = await useAsyncData('completed', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'completed'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: refunded
    } = await useAsyncData('refunded', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'refunded'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    const {
        data: cancelled
    } = await useAsyncData('cancelled', async () => {
        const resp = await $directus.request($readItems('orders', {
            fields: ['*', {
                '*': ['*']
            }],
            filter: {
                user_id: {
                    _eq: user?.id
                },
                payment_status: {
                    _eq: 'cancelled'
                }
            },
            sort: '-dated_created'
        }))
        return resp?.data ?? resp ?? []
    })

    useHead({
        title: 'Activity Feed',
    })
</script>