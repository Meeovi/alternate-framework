<template>
    <section class="product-details">
        <div class="container-fluid">
            <div class="row">
                <div class="col-12 col-md-6">
                    <div v-if="product?.image?.filename_disk">
                        <img :src="`${$directus.url}assets/${product.image.filename_disk}`" :alt="product.name"
                            class="w-full rounded-md" />
                    </div>
                </div>
                <div class="col-12 col-md-6">
                    <div class="right">
                        <h1 class="mb-1 font-bold typography-headline-4"><strong>{{ product?.name }}</strong></h1>
                        <div class="price-line">
                            <span class="block pb-2 font-bold typography-text-lg">
                                {{ product?.price }}
                            </span>
                        </div>
                        <p class="productRatings">
                            <v-rating size="lg" :half-increment="true" :value="product?.ratings?.length || 0"
                                :max="5" />
                            <NuxtLink to="#" variant="secondary" class="ratingReviews ml-2 text-xs text-neutral-500">
                                {{ product?.comments?.comments_id?.length || 0 }} reviews
                            </NuxtLink>
                        </p>
                        <div class="py-4 mb-4 border-gray-200 border-y">
                            <div class="row items-start xs:flex">
                                <div class="col col-6 flex flex-col items-stretch xs:items-center xs:inline-flex">
                                    <div class="flex border border-neutral-300 rounded-md">
                                        <v-btn variant="flat" :disabled="count <= min" square class="rounded-r-none p-3"
                                            :aria-controls="inputId" aria-label="Decrease value" @click="dec()">
                                            <SfIconRemove />
                                        </v-btn>
                                        <input :id="inputId" v-model="count" type="number"
                                            class="grow appearance-none mx-2 w-8 text-center bg-transparent font-medium"
                                            :min="min" :max="max" @input="handleOnChange" />
                                        <v-btn variant="flat" :disabled="count >= max" square class="rounded-l-none p-3"
                                            :aria-controls="inputId" aria-label="Increase value" @click="inc()">
                                            <SfIconAdd />
                                        </v-btn>
                                    </div>
                                    <p class="self-center mt-1 mb-4 text-xs text-neutral-500 xs:mb-0">
                                        <strong class="text-neutral-900">{{ product?.stock }}</strong> in stock
                                    </p>
                                </div>
                                <div class="col col-6">
                                    <addToCartBtn :product="product?.id" :quantity="count" />
                                </div>
                            </div>
                        </div>
                        <div class="mbr-section-btn row align-items-stretch justify-content-center">
                            <div class="col col-6">
                                <createListBtn :lists="product?.id" />
                            </div>
                        </div>
                        <div class="price-line1" v-for="tag in product?.tags" :key="tag.id">
                            <p class="desc mbr-fonts-style display-7"><strong>Tags:</strong> <tagCard :tag="tag?.tag_id" />&nbsp;</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import {
        ref
    } from 'vue';
    import {
        SfIconAdd,
        SfIconRemove,
    } from '@storefront-ui/vue';
    import {
        clamp
    } from '@storefront-ui/shared';
    import {
        useCounter
    } from '@vueuse/core';
    import tagCard from '#social/app/components/related/tag.vue';
    import addToCartBtn from '../../partials/addToCartBtn.vue';
    import createListBtn from '#lists/app/components/partials/createListBtn.vue';

    const {
        $directus,
    } = useNuxtApp()
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
        set(clamp(nextValue, min.value, max.value));
    }

    const props = defineProps({
        product: {
            type: Object,
            required: true
        },
    });

    const formatPrice = (amount: number) => {
        if (!amount) return '$0.00';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
        }).format(amount / 100);
    };
</script>