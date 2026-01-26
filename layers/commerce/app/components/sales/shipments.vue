<template>
    <div>
        <!--<profilebar />-->
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
                    <div class="card col-12 col-lg-3 col-md-6 col-sm-6" v-for="shipment in shipments" :key="shipment.id">
                        <div class="card_wrapper">
                            <div class="card-box">
                                <div class="icon_block">
                                    <div class="iconfont-wrapper">
                                        <span class="mbr-iconfont mobi-mbri-cart-full mobi-mbri"></span>
                                    </div>
                                </div>
                                <p class="card-text mbr-fonts-style display-4">Shipment: {{ shipment.id }}</p>
                                <p class="card-text mbr-fonts-style display-4">Ship Date: {{ new Date(shipment.createdAt).toLocaleDateString() }}</p>
                                <p class="card-text mbr-fonts-style display-4">Order #: {{ shipment.order?.code }}</p>
                                <p class="card-text mbr-fonts-style display-4">Total Quantity: {{ shipment.lines?.length }}</p>
                                <p class="btn_link mbr-fonts-style display-4"><a :href="`/account/user/shipment/${shipment.id}`" class="text-secondary">View<span class="mobi-mbri mobi-mbri-right mbr-iconfont"></span></a></p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue';
    import {
        useVendureQuery
    } from '../../composables/useVendureQuery';
    import getCustomerShipmentsQuery from '#graphql/app/commerce/queries/getCustomerShipments.gql';

    const shipments = ref([]);
    const {
        data,
        refetch
    } = useVendureQuery(getCustomerShipmentsQuery);

    onMounted(() => {
        if (data.value?.activeCustomer?.shipments?.items) {
            shipments.value = data.value.activeCustomer.shipments.items;
        }
    });

    useHead({
        title: 'Shipments',
    })

    definePageMeta({
        //middleware: ['auth-logged-in'],
    })
</script>