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
                                        <a class="card-text mbr-fonts-style display-7" :href="`/order/${order?.orderId}`">Order #:
                                            {{ order?.orderId }}</a>
                                        <p class="card-text mbr-fonts-style display-7">Order Date:
                                            {{ order?.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : '' }}</p>
                                        <p class="card-text mbr-fonts-style display-7">Payment Status:
                                            {{ order?.paymentStatus }}</p>
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
                                        <template v-if="order?.trackingNumber">
                                            <p class="card-text mbr-fonts-style display-7">Carrier: {{ order?.carrier }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Tracking #: {{ order?.trackingNumber }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Status: {{ order?.status || order?.fulfillmentStatus }}</p>
                                            <a v-if="order?.trackingUrl" class="card-text mbr-fonts-style display-7" :href="order.trackingUrl" target="_blank" rel="noopener">Track this shipment</a>
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
                <v-data-table :headers="headers" :items="order?.lineItems || []" :items-per-page="5" class="elevation-1">
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
    const route = useRoute();

    // [...id].vue is a catch-all route, so route.params.id is an array.
    // Ownership is enforced server-side by server/api/shipment/order-
    // tracking.get.ts (requireAuth + orders.user_id scoping with a
    // privileged token) rather than by querying Directus directly from the
    // client — the client-exposed static Directus token has no per-session
    // scoping of its own, so a client-side `user_id` filter alone doesn't
    // actually stop anyone from reading another user's order.
    const orderId = computed(() =>
        Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
    )

    const {
        data: order
    } = await useAsyncData('shipment-order', () => {
        if (!orderId.value) return null
        return $fetch('/api/shipment/order-tracking', {
            query: { orderId: orderId.value }
        }).catch(() => null)
    })

    useHead({
        title: order?.value?.orderId ? `Shipment for order ${order.value.orderId}` : 'Shipment Page',
    })
</script>
