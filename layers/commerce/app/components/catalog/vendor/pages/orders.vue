<template>
    <v-card>
        <v-toolbar color="" title="Orders"></v-toolbar>
        <v-tabs v-model="tab" bg-color="primary">
            <v-tab value="one">Orders</v-tab>
            <v-tab value="two">Returns</v-tab>
        </v-tabs>
        <v-card-text>
            <v-tabs-window v-model="tab">
                <v-tabs-window-item value="one">
                    <div v-if="orders.length">
                        <div v-for="order in orders" :key="order.id">
                            <p>Order #: {{ order.code }}</p>
                            <p>Status: {{ order.state }}</p>
                            <p>Total: {{ formatPrice(order.totalWithTax) }}</p>
                        </div>
                    </div>
                    <div v-else>No orders found.</div>
                </v-tabs-window-item>
                <v-tabs-window-item value="two">
                    <!-- Returns tab can be filled with returns/refunds if needed -->
                </v-tabs-window-item>
            </v-tabs-window>
        </v-card-text>
    </v-card>
</template>

<script setup lang="ts">
    import {
        ref,
        onMounted
    } from 'vue';
    import {
        useVendureQuery
    } from '@/app/composables/useVendureQuery';
    import getOrderListQuery from '#graphql/app/commerce/queries/getOrderList.gql';

    const tab = ref('one');
    const orders = ref([]);
    const {
        data,
        refetch
    } = useVendureQuery(getOrderListQuery);

    onMounted(() => {
        if (data.value?.orders?.items) {
            orders.value = data.value.orders.items;
        }
    });

    const formatPrice = (amount: number) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };


    definePageMeta({
      layout: "sellers",
      middleware: ['authenticated'],
    });

    useHead({
        title: 'Sellers Orders'
    })
</script>