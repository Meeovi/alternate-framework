<template>
    <v-container class="py-16 px-6" max-width="1200">
        <v-row>
            <!-- LEFT: Cart Items -->
            <v-col cols="12" md="8">
                <h1 class="text-h4 font-weight-medium mb-6">
                    Shopping Cart
                    <span class="text-indigo font-weight-regular text-body-2">
                        {{ cartItems.length }} Items
                    </span>
                </h1>

                <!-- Loading / Error -->
                <div v-if="pending" class="text-grey">Loading cart…</div>
                <div v-else-if="error" class="text-red">
                    Failed to load cart.
                </div>

                <template v-else>
                    <!-- Header Row -->
                    <v-row class="text-grey-darken-1 font-weight-medium pb-3">
                        <v-col cols="6">Product Details</v-col>
                        <v-col cols="3" class="text-center">Subtotal</v-col>
                        <v-col cols="3" class="text-center">Action</v-col>
                    </v-row>

                    <!-- Product Rows -->
                    <v-row v-for="item in cartItems" :key="item.id" class="py-3 text-grey-darken-1 align-center">
                        <!-- Product Details -->
                        <v-col cols="6">
                            <div class="d-flex align-center gap-4">
                                <v-card width="96" height="96" class="d-flex align-center justify-center"
                                    variant="outlined">
                                    <v-img :src="item.imageUrl" :alt="item.name" cover />
                                </v-card>

                                <div>
                                    <p class="font-weight-semibold">{{ item.name }}</p>

                                    <div class="text-grey-darken-1 text-body-2">
                                        <p v-if="item.size">
                                            Size: <strong>{{ item.size }}</strong>
                                        </p>

                                        <div class="d-flex align-center">
                                            <span class="mr-2">Qty:</span>
                                            <v-select :model-value="item.quantity" :items="[1,2,3,4,5]"
                                                density="compact" hide-details style="max-width: 70px"
                                                @update:model-value="updateQty(item)" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </v-col>

                        <!-- Subtotal -->
                        <v-col cols="3" class="text-center">
                            ${{ item.subtotal }}
                        </v-col>

                        <!-- Remove -->
                        <v-col cols="3" class="text-center">
                            <v-btn icon color="red" variant="text" @click="onRemove(item)">
                                <v-icon>mdi-close</v-icon>
                            </v-btn>
                        </v-col>
                    </v-row>

                    <!-- Continue Shopping -->
                    <v-btn variant="text" color="indigo" class="mt-8">
                        <v-icon start>mdi-arrow-left</v-icon>
                        Continue Shopping
                    </v-btn>
                </template>
            </v-col>

            <!-- RIGHT: Order Summary -->
            <v-col cols="12" md="4">
                <v-card variant="outlined" class="pa-5">
                    <h2 class="text-h6 font-weight-medium">Order Summary</h2>
                    <v-divider class="my-5" />

                    <!-- Delivery Address (still local UI, could be wired to sdk.customer later) -->
                    <div>
                        <p class="text-caption font-weight-medium">DELIVERY ADDRESS</p>

                        <div class="d-flex justify-space-between align-start mt-2 position-relative">
                            <p class="text-grey-darken-1">
                                {{ selectedAddressLabel }}
                            </p>

                            <v-menu v-model="showAddress" location="bottom end">
                                <template #activator="{ props }">
                                    <v-btn v-bind="props" variant="text" color="indigo">Change</v-btn>
                                </template>

                                <v-list>
                                    <v-list-item v-for="addr in addresses" :key="addr.id" @click="selectAddress(addr)">
                                        <v-list-item-title>{{ addr.label }}</v-list-item-title>
                                    </v-list-item>

                                    <v-list-item @click="onAddAddress" color="indigo">
                                        <v-list-item-title>Add address</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                        </div>

                        <!-- Payment Method (could also come from sdk.checkout.getPaymentMethods) -->
                        <p class="text-caption font-weight-medium mt-6">PAYMENT METHOD</p>

                        <v-select v-model="paymentMethod" :items="paymentMethods" item-title="label" item-value="code"
                            density="comfortable" class="mt-2" />
                    </div>

                    <v-divider class="my-5" />

                    <!-- Price Summary -->
                    <div class="text-grey-darken-1" v-if="totals">
                        <div class="d-flex justify-space-between mb-2">
                            <span>Price</span><span>${{ totals.subtotal }}</span>
                        </div>
                        <div class="d-flex justify-space-between mb-2">
                            <span>Shipping Fee</span>
                            <span :class="totals.shipping === 0 ? 'text-green' : ''">
                                {{ totals.shipping === 0 ? 'Free' : '$' + totals.shipping }}
                            </span>
                        </div>
                        <div class="d-flex justify-space-between mb-2">
                            <span>Tax</span><span>${{ totals.tax }}</span>
                        </div>

                        <div class="d-flex justify-space-between text-h6 font-weight-medium mt-4">
                            <span>Total Amount:</span><span>${{ totals.grandTotal }}</span>
                        </div>
                    </div>

                    <v-btn block color="indigo" class="mt-6" size="large" :disabled="!cartItems.length"
                        @click="onPlaceOrder">
                        Place Order
                    </v-btn>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script setup lang="ts">
    import {
        computed,
        ref
    } from "vue";
    import {
        useAsyncData,
        useNuxtApp
    } from "#imports";

    type CartItem = {
        id: string;
        sku: string;
        productId: string;
        productType: string;
        productUrl: string;
        name: string;
        imageUrl: string;
        quantity: number;
        size?: string | number;
        unitPrice: number;
        subtotal: number;
    };

    type CartTotals = {
        subtotal: number;
        shipping: number;
        tax: number;
        grandTotal: number;
    };

    const {
        $sdk
    } = useNuxtApp();

    // --- CART DATA (backend-agnostic) ---
    const {
        data,
        pending,
        error,
        refresh
    } = await useAsyncData(
        "cart",
        async () => {
            // This is the only place that knows about the commerce contract.
            // Magento adapter just implements sdk.commerce.getCart() behind the scenes.
            const cart = await $sdk.commerce.getCart();
            return cart;
        }
    );

    const cartItems = computed < CartItem[] > (() => data.value?.items ?? []);
    const totals = computed < CartTotals | null > (() => data.value?.totals ?? null);

    // --- ADDRESS (could later be wired to sdk.customer.getAddresses) ---
    const showAddress = ref(false);
    const addresses = ref([{
            id: "addr-1",
            label: "No address found"
        }, // placeholder
        {
            id: "addr-2",
            label: "New York, USA"
        },
    ]);
    const selectedAddressId = ref("addr-1");

    const selectedAddressLabel = computed(() => {
        return addresses.value.find((a) => a.id === selectedAddressId.value)?.label ?? "No address found";
    });

    function selectAddress(addr: {
        id: string;label: string
    }) {
        selectedAddressId.value = addr.id;
        showAddress.value = false;
    }

    function onAddAddress() {
        // In a real app, open a modal and then push to addresses + select it.
        showAddress.value = false;
    }

    // --- PAYMENT METHODS (could come from sdk.checkout.getPaymentMethods) ---
    const paymentMethods = ref([{
            code: "cod",
            label: "Cash On Delivery"
        },
        {
            code: "online",
            label: "Online Payment"
        },
    ]);
    const paymentMethod = ref("cod");

    // --- ACTIONS (all backend-agnostic, call SDK contract) ---
    async function onChangeQty(item: CartItem, quantity: number) {
        await $sdk.commerce.updateCartItemQuantity(item.id, quantity);
        await refresh();
    }

    function updateQty(item: CartItem) {
        return (quantity: number) => onChangeQty(item, quantity);
    }

    async function onRemove(item: CartItem) {
        await $sdk.commerce.removeCartItem(item.id);
        await refresh();
    }

    async function onPlaceOrder() {
        // Example: delegate to a generic checkout flow
        await $sdk.checkout.startCheckout({
            cartId: data.value?.id,
            paymentMethod: paymentMethod.value,
            addressId: selectedAddressId.value,
        });
    }
</script>