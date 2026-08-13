<template>
    <div>
        <section class="firmm4_features1 features1">
            <div class="container-fluid">
                <div class="row">
                    <div class="col-12 title_block">
                        <h3 class="mbr-section-title mbr-fonts-style align-center mb-0 display-2">
                            <strong>Shipments</strong>
                        </h3>
                    </div>
                </div>
                <div class="row justify-content-center">
                    <div class="card col-12 col-lg-3 col-md-6 col-sm-6" v-for="order in shippedOrders" :key="order.id">
                        <div class="card_wrapper">
                            <div class="card-box">
                                <div class="icon_block">
                                    <div class="iconfont-wrapper">
                                        <span class="mbr-iconfont mobi-mbri-cart-full mobi-mbri"></span>
                                    </div>
                                </div>
                                <p class="card-text mbr-fonts-style display-4">Order: {{ order?.id }}</p>
                                <p class="card-text mbr-fonts-style display-4">Ship Date: {{ order?.date_created ? new Date(order.date_created).toLocaleDateString() : '' }}</p>
                                <p class="card-text mbr-fonts-style display-4">Carrier: {{ order?.shipment_carrier }}</p>
                                <p class="card-text mbr-fonts-style display-4">Tracking #: {{ order?.tracking_number }}</p>
                                <p class="btn_link mbr-fonts-style display-4"><a :href="`/shipment/${order?.id}`" class="text-secondary">View<span class="mobi-mbri mobi-mbri-right mbr-iconfont"></span></a></p>
                            </div>
                        </div>
                    </div>
                    <div class="col-12" v-if="!shippedOrders?.length">
                        No shipments yet.
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
    import { useAuth } from '#auth/app/composables/useAuth'

    const { data: session } = await useAuth().getSession()
    const userId = session?.user?.id ?? null

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    // Shipment tracking lives on `orders` now (see server/api/payment/
    // stripe/webhooks.post.ts) — the legacy `shipments` collection this
    // component originally queried isn't accessible to this app's token.
    const {
        data: shippedOrders
    } = await useAsyncData('shippedOrders', async () => {
        if (!userId) return []
        return $directus.request($readItems('orders', {
            fields: ['id', 'date_created', 'tracking_number', 'shipment_carrier', 'shipment_status'],
            filter: {
                user_id: { _eq: userId },
                tracking_number: { _nnull: true }
            }
        }))
    })

    useHead({
        title: 'Shipments',
    })
</script>
