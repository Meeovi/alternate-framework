<template>
    <div>
        <section data-bs-version="5.1" class="features07 scalem5 cid-uhB4hw1yxB mbr-fullscreen" id="features07-9l">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-lg-10 card">
                        <div class="title-wrapper">
                            <h2 class="mbr-section-title mbr-fonts-style display-5">
                                View Shipment</h2>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="items-wrapper">
                            <div class="item features-without-image item-mb">
                                <div class="item-wrapper">
                                    <div class="card-box">
                                        <div class="icon-wrapper">
                                            <span class="mbr-iconfont mobi-mbri-growing-chart mobi-mbri"></span>
                                        </div>
                                        <h4 class="card-title mbr-fonts-style display-7">
                                            Order Information
                                        </h4>
                                        <a class="card-text mbr-fonts-style display-7" :href="`/order/${order?.id}`">Order #:
                                            {{ order?.id }}</a>
                                        <p class="card-text mbr-fonts-style display-7">Order Date:
                                            {{ order?.date_created ? new Date(order.date_created).toLocaleDateString() : '' }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Payment Status:
                                            {{ order?.payment_status }}</p>
                                    </div>
                                </div>
                            </div>
                            <div class="item features-without-image item-mb">
                                <div class="item-wrapper">
                                    <div class="card-box">
                                        <div class="icon-wrapper">
                                            <span class="mbr-iconfont mobi-mbri-cash mobi-mbri"></span>
                                        </div>
                                        <h4 class="card-title mbr-fonts-style display-7">
                                            Shipping and Tracking Information
                                        </h4>
                                        <template v-if="order?.tracking_number">
                                            <p class="card-text mbr-fonts-style display-7">Carrier: {{ order?.shipment_carrier }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Tracking #: {{ order?.tracking_number }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Status: {{ order?.shipment_status || order?.fulfillment_status }}</p>
                                            <a v-if="order?.tracking_url" class="card-text mbr-fonts-style display-7" :href="order.tracking_url" target="_blank" rel="noopener">Track this shipment</a>
                                        </template>
                                        <p v-else class="card-text mbr-fonts-style display-7">Not yet shipped.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NuxtImg provider="cloudinary" src="https://via.placeholder.com/1200x400" alt="Shipments" />
        </section>

        <v-card title="Shipment Items" flat>
            <div class="container">
                <v-data-table :headers="headers" :items="order?.line_items_snapshot || []" :items-per-page="5" class="elevation-1">
                    <template v-slot:[`item.name`]="{ item }">
                        <strong>{{ item.name }}</strong>
                    </template>
                    <template v-slot:[`item.quantity`]="{ item }">
                        {{ item.quantity }}
                    </template>
                </v-data-table>
            </div>
        </v-card>
    </div>
</template>

<script>
    export default {
        data: () => ({
            headers: [{
                    text: 'Product',
                    value: 'name'
                },
                {
                    text: 'Quantity',
                    value: 'quantity'
                }
            ],
        }),
    }
</script>

<script setup>
    import { useAuth } from '#auth/app/composables/useAuth'

    const route = useRoute();

    // [...id].vue is a catch-all route, so route.params.id is an array.
    // Shipment/tracking info lives on the `orders` collection now (see
    // server/api/payment/stripe/webhooks.post.ts) — the Magento-mirrored
    // `shipments` collection this page originally queried isn't accessible
    // to this app's API token.
    const orderId = computed(() =>
        Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    )

    const {
        $directus,
        $readItems
    } = useNuxtApp()

    const { data: session } = await useAuth().getSession()
    const currentUserId = session?.user?.id ?? null

    const {
        data: order
    } = await useAsyncData('shipment-order', async () => {
        if (!currentUserId) return null
        const results = await $directus.request($readItems('orders', {
            filter: {
                id: { _eq: orderId.value },
                user_id: { _eq: currentUserId }
            },
            limit: 1
        }))
        return results?.[0] ?? null
    })

    useHead({
        title: order?.value?.id ? `Shipment for order ${order.value.id}` : 'Shipment Page',
    })
</script>
