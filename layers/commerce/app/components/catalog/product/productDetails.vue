<template>
    <section class="product-details">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12 col-md-6">
                    <div class="image-container">
                        <div v-if="hasAsset(productDetails?.image)">
                            <NuxtImg provider="cloudinary" :src="getAssetURL(productDetails?.image)"
                                :alt="productDetails?.name" class="w-full rounded-md" />
                        </div>
                    </div>
                </div>

                <div class="col-12 col-md-6">
                    <v-card class="right" elevation="0">

                        <v-list lines="one">
                            <!-- Product Title -->
                            <v-list-item>
                                <h1 class="mb-1 font-bold typography-headline-4">
                                    <strong>{{ productDetails?.name }}</strong>
                                </h1>
                            </v-list-item>

                            <!-- Product Made By -->
                            <v-list-item>
                                <v-list-item-title>
                                    By: <strong>{{ productDetails?.shop?.shop_id?.name || 'Unknown' }}</strong>
                                </v-list-item-title>
                            </v-list-item>

                            <!-- Product Price -->
                            <v-list-item>
                                <div style="display: inline-block;">
                                    <v-list-item-title>{{ pricing?.formatted?.final || productDetails?.price }}</v-list-item-title>

                                    <!-- Product Discount -->
                                    <v-list-subtitle v-if="pricing?.hasDiscount">
                                        <span>
                                            <s>{{ pricing?.formatted?.regular }}</s>
                                            <span class="pl-1">{{ pricing?.discountPercent }}% off via
                                                {{ pricing?.source }}</span>
                                        </span>
                                    </v-list-subtitle>
                                </div>
                            </v-list-item>


                            <!-- Product Rating -->
                            <v-list-item>
                                <v-list-item-title>
                                    <v-rating size="x-small" active-color="warning"
                                        :model-value="productDetails?.rating" :max="5" />
                                    <NuxtLink style="position: relative; top: -5px;"
                                        :to="`/product/${productDetails?.id}#commentsSection`"
                                        class="pl-1 no-underline">{{ productDetails?.rating }} reviews
                                    </NuxtLink>
                                </v-list-item-title>
                            </v-list-item>

                            <!-- Product Quantity -->
                            <v-list-item class="col col-3">
                                <div class="row">
                                    <v-list-item class="col-12"
                                        v-if="productDetails?.product_types?.product_types_id?.name !== 'Digital'">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex">
                                            <div class="flex border-neutral-300 rounded-md">
                                                <v-btn variant="flat" :disabled="count <= min" square size="x-small"
                                                    class="rounded-r-none p-3" :aria-controls="inputId"
                                                    aria-label="Decrease value" @click="dec()" icon="fas fa-minus">
                                                </v-btn>
                                                <v-text-field :id="inputId" v-model="count" type="number"
                                                    variant="underlined"
                                                    class="grow appearance-none mx-2 w-8 text-center bg-transparent font-medium"
                                                    :min="min" :max="max" @input="handleOnChange"
                                                    :hint="`${productDetails?.stock} in stock`" persistent-hint />
                                                <v-btn variant="flat" :disabled="count >= max" square size="x-small"
                                                    class="rounded-l-none p-3" :aria-controls="inputId"
                                                    aria-label="Increase value" @click="inc()" icon="fas fa-plus">
                                                </v-btn>
                                            </div>
                                        </div>
                                    </v-list-item>
                                </div>
                            </v-list-item>

                            <!-- Product Color Options -->
                            <v-list-item class="col col-6" v-if="productDetails?.color || productDetails?.size">
                                <div class="row">
                                    <v-list-item class="col-6">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex"
                                            v-if="productDetails?.color">
                                            <colorOptions :color="productDetails?.id" />
                                        </div>
                                    </v-list-item>

                                    <!-- Product Size Options -->
                                    <v-list-item class="col-6">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex"
                                            v-if="productDetails?.size">
                                            <sizeOptions :size="productDetails?.id" />
                                        </div>
                                    </v-list-item>
                                </div>
                            </v-list-item>

                            <!-- Product Add to Cart -->
                            <v-list-item class="col col-6">
                                <div class="row">
                                    <v-list-item class="col-6">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex"
                                            v-if="productDetails?.price > '0.01'">
                                            <addToCartBtn :product="productDetails" :quantity="count" />
                                        </div>

                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex" v-else>
                                            <v-btn prepend-icon="fas fa-download" :product="productDetails" text="Download" :href="productDetails?.file" download />
                                        </div>
                                    </v-list-item>

                                    <!-- Product Add to Compare -->
                                    <v-list-item class="col-6">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex">
                                            <compareBtn :product="productDetails?.id" />
                                        </div>
                                    </v-list-item>
                                </div>
                            </v-list-item>

                            <!-- Product Quantity -->
                            <v-list-item class="col col-6">
                                <div class="row">
                                    <!-- Product Create List -->
                                    <v-list-item class="col col-6">
                                        <div>
                                            <createListBtn :lists="productDetails?.id" />
                                        </div>
                                    </v-list-item>

                                    <!-- Product RSS Feed -->
                                    <v-list-item class="col col-6">
                                        <div class="flex flex-col items-stretch xs:items-center xs:inline-flex pt-3"
                                            v-if="productRssLink">
                                            <NuxtLink :to="productRssLink" target="_blank" rel="noopener"
                                                class="text-sm no-underline">
                                                Follow product feed
                                            </NuxtLink>
                                        </div>
                                    </v-list-item>
                                </div>
                            </v-list-item>

                            <!-- Product Tags -->
                            <v-list-item v-if="productDetails?.tags">
                                <div class="col col-6 flex flex-col items-stretch xs:items-center xs:inline-flex"
                                    v-for="tag in productDetails?.tags" :key="tag.id">
                                    <p class="desc mbr-fonts-style"><strong>Tags:</strong>
                                        <tagCard :tag="tag?.tag_id" />&nbsp;
                                    </p>
                                </div>
                            </v-list-item>
                        </v-list>
                    </v-card>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import {
        computed,
        ref
    } from '#imports';

    import {
        watch
    } from 'vue';
    import {
        useCounter
    } from '@vueuse/core';
    import {
        usePreferredCurrency
    } from '~/composables/catalog/usePreferredCurrency.ts';
    import {
        usePrice
    } from '../../../composables/catalog/price/price';
    import {
        useAppGateway
    } from '#shared/app/composables/useAppGateway';
    import tagCard from '#social/app/components/related/tag.vue';
    import addToCartBtn from '../../partials/addToCartBtn.vue';
    import compareBtn from '../../partials/compareBtn.vue';
    import createListBtn from '#social/app/components/blocks/partials/createListBtn.vue';
    import {
        getAssetURL,
        hasAsset
    } from '#shared/app/utils/get-asset-url'
    import sizeOptions from './sizeOptions.vue'
    import colorOptions from './colorOptions.vue'

    const inputId = useId();
    const min = ref(1);
    const max = ref(999);
    const {
        count,
        inc,
        dec,
        set
    } = useCounter(1, {
        min: min.value,
        max: max.value
    });

    function handleOnChange(event: Event) {
        const currentValue = (event.target as HTMLInputElement)?.value;
        const nextValue = Number.parseFloat(currentValue);
        set(Math.min(Math.max(nextValue, min.value), max.value));
    }

    const props = defineProps({
        productDetails: {
            type: Object,
            required: true
        },
    });

    const {
        currency: preferredCurrency
    } = usePreferredCurrency();
    const {
        getProductPrice
    } = usePrice();
    const {
        getProductRssLink
    } = useAppGateway().content;
    const pricing = computed(() => getProductPrice(props.productDetails || {}, {
        currency: preferredCurrency.value
    }));
    const productRssLink = ref < string | null > (null);

    watch(
        () => props.productDetails,
        async (product) => {
            productRssLink.value = product ? await getProductRssLink(product) : null;
        }, {
            immediate: true
        }
    );

    const formatPrice = (amount: number) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };
</script>