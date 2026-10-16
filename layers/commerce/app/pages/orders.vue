<template>
    <div>
        <section data-bs-version="5.1" class="info1 cid-v5A0K07pfT" id="info1-bd" data-sortbtn="btn-primary">
            <div class="mbr-overlay" style="opacity: 0.5; background-color: rgb(68, 121, 217);"></div>
            <div class="align-center container">
                <div class="row justify-content-center">
                    <div class="col-12 col-lg-8">
                        <h3 class="mbr-section-title mb-4 mbr-fonts-style display-1">
                            <strong> {{ ordersPage?.value?.name }}</strong>
                        </h3>
                        <p class="mbr-section-title mb-4 mbr-fonts-style display-7" v-dompurify-html="ordersPage?.value?.content"></p>
                    </div>
                </div>
            </div>
        </section>

        <v-card variant="text">
            <v-toolbar :style="`background-color: ${orderBar?.value?.color}; color: ${orderBar?.value?.colortext} !important`">
                <v-toolbar-title>{{ orderBar?.value?.name }}</v-toolbar-title>


                <v-tabs v-model="tab" align-tabs="center">
                    <div v-for="(menu, index) in orderBar?.value?.menus" :key="index">
                        <v-tab :value="menu?.value">
                            <v-btn variant="text"
                                :style="`color: ${orderBar?.value?.colortext} !important`">{{ menu?.name }}</v-btn>
                        </v-tab>
                    </div>
                </v-tabs>
            </v-toolbar>
        </v-card>

        <v-tabs-window v-model="tab">
            <!--Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[0]?.value">
                <v-row class="media-container-row">
                    <template v-if="orders?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="order in orders?.value" :key="order.id">
                            <orderCard :order="order" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Activity yet</div>
                </v-row>
            </v-tabs-window-item>

            <!--Pending Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[1]?.value">
                <v-row class="media-container-row">
                    <template v-if="pending?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="pendingOrder in pending?.value"
                            :key="pendingOrder.id">
                            <orderCard :order="pendingOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Pending Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Processing Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[2]?.value">
                <v-row class="media-container-row">
                    <template v-if="processing?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="processingOrder in processing?.value"
                            :key="processingOrder.id">
                            <orderCard :order="processingOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Processing Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--On Hold Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[3]?.value">
                <v-row class="media-container-row">
                    <template v-if="onHold?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="onHoldOrder in onHold?.value"
                            :key="onHoldOrder.id">
                            <orderCard :order="onHoldOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No On Hold Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Failed Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[4]?.value">
                <v-row class="media-container-row">
                    <template v-if="failed?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="failedOrder in failed?.value"
                            :key="failedOrder.id">
                            <orderCard :order="failedOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Failed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Disputed Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[5]?.value">
                <v-row class="media-container-row">
                    <template v-if="disputed?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="disputedOrder in disputed?.value"
                            :key="disputedOrder.id">
                            <orderCard :order="disputedOrder" />
                        </v-col>
                    </template>

                    <div class="center-text" v-else>No Disputed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Completed Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[6]?.value">
                <v-row class="media-container-row">
                    <template v-if="completed?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="completedOrder in completed?.value"
                            :key="completedOrder.id">
                            <orderCard :order="completedOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Completed Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Refunded Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[7]?.value">
                <v-row class="media-container-row">
                    <template v-if="refunded?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="refundedOrder in refunded?.value"
                            :key="refundedOrder.id">
                            <orderCard :order="refundedOrder" />
                        </v-col>
                    </template>
                    <div class="center-text" v-else>No Refunded Orders</div>
                </v-row>
            </v-tabs-window-item>

            <!--Cancelled Orders-->
            <v-tabs-window-item :value="orderBar?.value?.menus?.[8]?.value">
                <v-row class="media-container-row">
                    <template v-if="cancelled?.value?.length">
                        <v-col class="wrap col-sm-12 col-lg-4 feedPost" v-for="cancelOrder in cancelled?.value"
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

<script setup lang="ts">

    import {
        ref,
        computed
    } from '#imports'
    import orderCard from '../components/related/orderCard.vue'
    import { useAuth } from '#auth/app/composables/useAuth'

    const {
        $directus,
        $readItem,
        $readItems
    } = useNuxtApp() as any

    const { data: session } = await useAuth().getSession()
    const currentUserId = session?.user?.id ?? null

    const tab = ref(null);

    // payment_status now genuinely reaches 'pending'/'completed'/'failed'
    // (checkout.session.*), 'refunded' (charge.refunded), and 'disputed'
    // (charge.dispute.created) via server/api/payment/stripe/webhooks.post.ts.
    // 'processing', 'on-hold', and 'cancelled' have no producer anywhere in
    // this app yet — there's no admin/staff action that sets them — so
    // those three tabs will legitimately stay empty until that exists.
    // Every source's orders (each commerce backend's own history, plus the
    // app's Directus orders) come from /api/commerce/orders; the tabs are
    // just filters on that one list.
    const { data: orderHistory } = await useFetch<{ orders: any[] }>('/api/commerce/orders', {
        key: 'order-history',
        headers: useRequestHeaders(['cookie']),
        default: () => ({ orders: [] }),
        immediate: !!currentUserId,
    })
    const byStatus = (status?: string) => computed(() =>
        (orderHistory.value?.orders ?? []).filter((o) => !status || o.payment_status === status))

    const { data: orderBar } = await useAsyncData<any>('orderBar', () => {
        return $directus.request($readItem('navigation', '84', {
            fields: ['*', { '*': ['*'] }]
        }))
    })

    const { data: ordersPage } = await useAsyncData<any>('ordersPage', () => {
        return $directus.request($readItem('pages', '106', {
            fields: ['*', { '*': ['*'] }]
        }))
    })

    const orders = byStatus()
    const pending = byStatus('pending')
    const processing = byStatus('processing')
    const onHold = byStatus('on-hold')
    const failed = byStatus('failed')
    const disputed = byStatus('disputed')
    const completed = byStatus('completed')
    const refunded = byStatus('refunded')
    const cancelled = byStatus('cancelled')

    useHead({
        title: 'Activity Feed',
    })
</script>