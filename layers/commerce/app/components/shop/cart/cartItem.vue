<template>
    <section class="shop2 marketm4_shop2 cid-uHg6RhKlpj" id="shop2-av">
        <div class="container">
            <div class="row justify-content-between align-items-center">
                <div class="col-xl-6 col-lg-7 col-md-12 content__block">
                    <h2 class="mbr-section-title mbr-bold mbr-fonts-style display-5">
                        Shopping Cart ({{ itemCount }} items)
                    </h2>
                    <div class="block__products">
                        <div v-if="product" class="d-sm-flex align-items-center product__item">
                            <!-- Product Image -->
                            <div class="image__item shrink-0">
                                <NuxtImg :src="product?.featuredAsset?.preview" :alt="product?.name" loading="lazy" />
                            </div>
                            <!-- Product Details -->
                            <div class="item__text">
                                <div class="d-flex justify-content-between align-items-baseline item__title">
                                    <p class="name__item mbr-medium mbr-fonts-style display-4">
                                        {{ product?.name }}
                                    </p>
                                    <p class="item__price mbr-fonts-style display-4">
                                        {{ formatPrice(product?.unitPriceWithTax) }}
                                    </p>
                                </div>
                                <!-- Quantity Controls -->
                                <div class="item__buttons">
                                    <div class="mbr-section-btn">
                                        <div class="flex border border-neutral-300 rounded-md">
                                            <!-- Decrease Quantity -->
                                            <v-btn variant="tertiary" :disabled="count <= min" square
                                                class="rounded-r-none p-3" :aria-controls="inputId"
                                                aria-label="Decrease quantity" @click="handleDecrease">
                                                <SfIconRemove />
                                            </v-btn>

                                            <!-- Quantity Input -->
                                            <input :id="inputId" v-model="count" type="number"
                                                class="grow appearance-none mx-2 w-8 text-center bg-transparent font-medium"
                                                :min="min" :max="max" @change="handleQuantityChange"
                                                aria-label="Product quantity" />

                                            <!-- Increase Quantity -->
                                            <v-btn variant="tertiary" :disabled="count >= max" square
                                                class="rounded-l-none p-3" :aria-controls="inputId"
                                                aria-label="Increase quantity" @click="handleIncrease">
                                                <SfIconAdd />
                                            </v-btn>
                                        </div>
                                        <!-- Stock Information -->
                                        <p class="self-center mt-1 mb-4 text-xs text-neutral-500 xs:mb-0">
                                            <strong class="text-neutral-900">{{ max }}</strong> in stock
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <!-- Empty State -->
                        <div v-else class="empty-product">
                            <p>Product not available</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {  SfIconAdd, SfIconRemove, useId } from '@storefront-ui/vue';
import { useVendureMutation } from '../../composables/useVendureMutation';
import adjustOrderLineMutation from '#graphql/app/commerce/mutations/adjustOrderLine.gql';
import removeOrderLineMutation from '#graphql/app/commerce/mutations/removeOrderLine.gql';

const props = defineProps({
    product: { type: Object, required: true },
    min: { type: Number, default: 1 },
    max: { type: Number, default: 99 },
    cart: { type: Object, required: false }, // for itemCount
});

const count = ref(props.product.quantity);
const inputId = useId();

const { mutate: adjustOrderLine } = useVendureMutation(adjustOrderLineMutation);
const { mutate: removeOrderLine } = useVendureMutation(removeOrderLineMutation);

const itemCount = computed(() => {
    return props.cart?.lines?.reduce((total: number, line: any) => total + (line.quantity || 1), 0) || 0;
});

const formatPrice = (amount: number) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(amount / 100);
};

const handleQuantityChange = async () => {
    if (count.value >= props.min && count.value <= props.max) {
        await adjustOrderLine({ orderLineId: props.product.id, quantity: count.value });
    }
};

const handleIncrease = async () => {
    if (count.value < props.max) {
        count.value++;
        await adjustOrderLine({ orderLineId: props.product.id, quantity: count.value });
    }
};

const handleDecrease = async () => {
    if (count.value > props.min) {
        count.value--;
        await adjustOrderLine({ orderLineId: props.product.id, quantity: count.value });
    } else {
        await removeOrderLine({ orderLineId: props.product.id });
    }
};

watch(() => props.product.quantity, (newQuantity) => {
    if (newQuantity !== count.value) {
        count.value = newQuantity;
    }
}, { immediate: true });
</script>

<style scoped>
    .product__item {
        padding: 1rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }

    .image__item {
        width: 100px;
        height: 100px;
        margin-right: 1rem;
    }

    .image__item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }

    .item__text {
        flex: 1;
    }

    .name__item {
        margin-bottom: 0.5rem;
        font-weight: 500;
    }

    .item__price {
        font-weight: bold;
        color: var(--primary-color);
    }

    .item__buttons {
        margin-top: 1rem;
    }

    input[type="number"] {
        -moz-appearance: textfield;
    }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }

    .empty-product {
        padding: 1rem;
        text-align: center;
        color: #666;
    }
</style>