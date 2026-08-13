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
            <v-tabs-window-item :value="orderBar?.menus?.[5]?.value">
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
            <v-tabs-window-item :value="orderBar?.menus?.[6]?.value">
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
            <v-tabs-window-item :value="orderBar?.menus?.[7]?.value">
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
            <v-tabs-window-item :value="orderBar?.menus?.[8]?.value">
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
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()
    const currentUserId = session?.user?.id ?? null

    const tab = ref(null);

    // payment_status now genuinely reaches 'pending'/'completed'/'failed'
    // (checkout.session.*), 'refunded' (charge.refunded), and 'disputed'
    // (charge.dispute.created) via server/api/payment/stripe/webhooks.post.ts.
    // 'processing', 'on-hold', and 'cancelled' have no producer anywhere in
    // this app yet — there's no admin/staff action that sets them — so
    // those three tabs will legitimately stay empty until that exists.
    const fetchOrders = (status?: string) => useAsyncData<any>(
        status ? `orders-${status}` : 'orders',
        async () => {
            if (!currentUserId) return []
            // Explicit field list — orders/invoices/transactions have a
            // broken Directus M2M relation between invoices and
            // transactions (invoices.transaction_id / transactions.invoices
            // are declared alias fields with no relation config behind
            // them), so any wildcard/deep-expand fields param here throws
            // a Directus 500. This needs a real schema fix in Directus
            // (reconfigure or remove that relation); until then, only
            // request fields orderCard.vue actually renders.
            return $directus.request($readItems('orders', {
                fields: ['id', 'date_created', 'customer_firstname', 'customer_lastname', 'payment_status'],
                filter: {
                    user_id: { _eq: currentUserId },
                    ...(status && { payment_status: { _eq: status } })
                },
                sort: ['-date_created']
            }))
        }
    )

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

    const { data: orders } = await fetchOrders()
    const { data: pending } = await fetchOrders('pending')
    const { data: processing } = await fetchOrders('processing')
    const { data: onHold } = await fetchOrders('on-hold')
    const { data: failed } = await fetchOrders('failed')
    const { data: disputed } = await fetchOrders('disputed')
    const { data: completed } = await fetchOrders('completed')
    const { data: refunded } = await fetchOrders('refunded')
    const { data: cancelled } = await fetchOrders('cancelled')

    useHead({
        title: 'Activity Feed',
    })
</script>