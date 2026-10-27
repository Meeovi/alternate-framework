<template>
    <section class="product-details">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12 col-md-6">
                    <div class="image-container">
                        <NuxtImg provider="cloudinary" :src="getImageURL(productDetails?.image)"
                            :alt="productDetails?.name" class="w-full rounded-md" />
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
                                    By: <strong>
                                        <NuxtLink v-if="sellerProfile" :to="sellerProfile">{{ sellerName }}</NuxtLink>
                                        <template v-else>{{ sellerName }}</template>
                                    </strong>
                                </v-list-item-title>
                            </v-list-item>

                            <!-- Product Price -->
                            <v-list-item>
                                <div style="display: inline-block;">
                                    <v-list-item-title>{{ isFree ? 'Free' : (pricing?.formatted?.final || productDetails?.price) }}</v-list-item-title>

                                    <!-- Product Discount -->
                                    <v-list-item-subtitle v-if="pricing?.hasDiscount">
                                        <span>
                                            <s>{{ pricing?.formatted?.regular }}</s>
                                            <span class="pl-1">{{ pricing?.discountPercent }}% off via
                                                {{ pricing?.source }}</span>
                                        </span>
                                    </v-list-item-subtitle>
                                </div>
                            </v-list-item>


                            <!-- Product Rating -->
                            <v-list-item>
                                <v-list-item-title>
                                    <!-- People's 1–5 star ratings (@mframework/meeovi-ratings) -->
                                    <MeeoviRating type="product" :id="productDetails?.id" />
                                    <NuxtLink :to="`/product/${productDetails?.id}#commentsSection`"
                                        class="pl-1 no-underline">Discussion
                                    </NuxtLink>
                                </v-list-item-title>
                            </v-list-item>

                            <!-- Product Quantity (only for things bought through the cart) -->
                            <v-list-item v-if="!isFree && productDetails?.product_types?.product_types_id?.name !== 'Digital'">
                                <div class="product-actions">
                                    <div class="qty-stepper">
                                        <v-btn variant="flat" :disabled="count <= min" square size="x-small"
                                            class="qty-stepper__btn" :aria-controls="inputId"
                                            aria-label="Decrease value" @click="dec()" icon="fas fa-minus">
                                        </v-btn>
                                        <v-text-field :id="inputId" v-model="count" type="number"
                                            variant="underlined"
                                            class="qty-stepper__input mx-2 text-center"
                                            :min="min" :max="max" @input="handleOnChange" hide-details />
                                        <v-btn variant="flat" :disabled="count >= max" square size="x-small"
                                            class="qty-stepper__btn" :aria-controls="inputId"
                                            aria-label="Increase value" @click="inc()" icon="fas fa-plus">
                                        </v-btn>
                                    </div>
                                    <!-- Beside the stepper rather than as the input's hint, which
                                         wrapped onto two lines under the 3.5rem-wide field. -->
                                    <span v-if="productDetails?.stock != null" class="text-caption text-medium-emphasis">
                                        {{ productDetails.stock }} in stock
                                    </span>
                                </div>
                            </v-list-item>

                            <!-- Product Color / Size Options -->
                            <v-list-item v-if="productDetails?.color || productDetails?.size">
                                <div class="product-actions">
                                    <colorOptions v-if="productDetails?.color" :color="productDetails?.id" />
                                    <sizeOptions v-if="productDetails?.size" :size="productDetails?.id" />
                                </div>
                            </v-list-item>

                            <!-- Product Add to Cart / Download / Install + Compare. These were nested
                                 col-6 grids inside a col-6 list item, so each button got a
                                 quarter of the panel and was clipped; a wrapping flex row
                                 lets them take their natural width. -->
                            <v-list-item>
                                <div class="product-actions">
                                    <!-- Picks Add to Cart (priced), Install (free integration)
                                         or Download (free with a file) itself. -->
                                    <addToCartBtn :product="productDetails" :quantity="count" />
                                    <compareBtn :product="productDetails" />
                                </div>
                            </v-list-item>

                            <!-- Create List / RSS Feed -->
                            <v-list-item>
                                <div class="product-actions">
                                    <createListBtn :item="listProduct" kind="product" />
                                    <NuxtLink v-if="productRssLink" :to="productRssLink" target="_blank"
                                        rel="noopener" class="text-sm no-underline">
                                        Follow product feed
                                    </NuxtLink>
                                </div>
                            </v-list-item>

                            <!-- Product Tags -->
                            <v-list-item v-if="productTags.length">
                                <div class="product-actions">
                                    <strong>Tags:</strong>
                                    <tagCard v-for="tag in productTags" :key="tag.id" :tag="tag" />
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
    } from '../../../composables/catalog/price/usePreferredCurrency';
    import {
        usePrice
    } from '../../../composables/catalog/price/price';
    import {
        useAppGateway
    } from '#shared/app/composables/useAppGateway';
    import tagCard from '#social/app/components/related/tag.vue';
    import addToCartBtn from '../../blocks/addToCartBtn.vue';
    import compareBtn from '../../blocks/compareBtn.vue';
    import createListBtn from '#social/app/components/blocks/partials/createListBtn.vue';
    import { parseProductKey, productKey } from '../../../utils/productKey';
    import {
        getAssetURL,
        getImageURL,
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
    // Nothing to pay: no cart, no quantity — Install or Download instead.
    const isFree = computed(() => !((pricing.value?.final ?? Number(props.productDetails?.price)) > 0))

    // products.tags is the products_tags junction ({ tags_id: {...} }); skip
    // rows whose tag wasn't expanded or has been deleted.
    const productTags = computed(() => (props.productDetails?.tags || [])
        .map((row: any) => row?.tags_id)
        .filter((tag: any) => tag && typeof tag === 'object' && (tag.name || tag.slug)));

    // A commerce backend's product (`magento:<sku>`) has its seller in that
    // backend; Directus products name their shop on the product.
    const backendKey = computed(() => {
        const key = productKey(props.productDetails)
        return parseProductKey(key) ? key : null
    })
    const { data: backendSeller } = useLazyFetch('/api/commerce/products/seller', {
        query: { key: backendKey },
        immediate: !!backendKey.value,
        watch: [backendKey],
    })
    const sellerName = computed(() => (backendKey.value
        ? (backendSeller.value as { seller?: { name?: string } } | null)?.seller?.name
        : props.productDetails?.shops?.[0]?.shops_id?.name) || 'Unknown')
    const sellerProfile = computed(() => {
        const username = (backendSeller.value as { seller?: { username?: string | null } } | null)?.seller?.username
        return backendKey.value && username ? `/u/${encodeURIComponent(username)}` : null
    })

    // createListBtn's panel needs a resolved image URL, not the raw Directus
    // asset reference productDetails.image holds. Its id is the product key:
    // the Directus id, or `<backend>:<sku>` (saved to lists_backend_products).
    const listProduct = computed(() => ({
        id: backendKey.value || props.productDetails?.id,
        name: props.productDetails?.name,
        image: hasAsset(props.productDetails?.image) ? getAssetURL(props.productDetails?.image) : undefined,
        price: pricing.value?.formatted?.final || props.productDetails?.price,
    }));

    watch(
        () => props.productDetails,
        async (product: any) => {
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

<style scoped>
/* Quantity stepper — replaces Tailwind utility classes (Tailwind isn't
   installed in this repo, so those classes were inert and the control
   rendered as a bare unstyled row). */
.qty-stepper {
    display: inline-flex;
    border: 1px solid rgba(var(--v-theme-on-surface), 0.23);
    border-radius: 4px;
    overflow: hidden;
    align-items: center;
}

.product-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
}

.qty-stepper__btn {
    border-radius: 0;
}

.qty-stepper__input {
    width: 3.5rem;
}

.qty-stepper__input :deep(input) {
    text-align: center;
    -moz-appearance: textfield;
}

.qty-stepper__input :deep(input::-webkit-outer-spin-button),
.qty-stepper__input :deep(input::-webkit-inner-spin-button) {
    -webkit-appearance: none;
    margin: 0;
}
</style>
