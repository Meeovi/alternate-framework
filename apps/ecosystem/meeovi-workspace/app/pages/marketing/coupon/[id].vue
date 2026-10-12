<template>
    <div class="contentPage">
        <!---->
        <section data-bs-version="5.1" class="features07 scalem5 cid-uhB4hw1yxB mbr-fullscreen" id="features07-9l">
            <div class="container">
                <div class="row">
                    <div class="col-12 col-lg-10 card">
                        <div class="title-wrapper">
                            <h2 class="mbr-section-title mbr-fonts-style display-5">
                                {{ coupon?.name }}</h2>
                        </div>
                    </div>
                    <div class="col-12 col-lg-8">
                        <div class="items-wrapper">
                            <div class="item features-without-image item-mb">
                                <div class="item-wrapper">
                                    <div class="card-box">
                                        <div class="icon-wrapper">
                                            <span class="mbr-iconfont mobi-mbri-cash mobi-mbri"></span>
                                        </div>
                                        <h4 class="card-title mbr-fonts-style display-7">
                                            Coupon Information
                                        </h4>
                                        <template v-if="coupon">
                                            <p class="card-text mbr-fonts-style display-7">Coupon Code: {{ coupon?.coupon_code }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Discount: {{ coupon?.discount_amount }} {{ coupon?.discount_type }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Usage per Customer: {{ coupon?.usage_per_customer }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Valid From: {{ coupon?.from_date ? new Date(coupon.from_date).toLocaleDateString() : '' }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Valid Until: {{ coupon?.to_date ? new Date(coupon.to_date).toLocaleDateString() : '' }}</p>
                                            <p class="card-text mbr-fonts-style display-7">Usage Limit: {{ coupon?.usage_limit }}</p>
                                        </template>
                                        <p v-else-if="loadError" class="card-text mbr-fonts-style display-7">{{ loadError }}</p>

                                        <p class="mt-4 card-text mbr-fonts-style display-7">
                                            Enter this code at checkout to apply the discount — codes are validated
                                            during payment, not on this page.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <NuxtImg loading="lazy" :src="`${$directus.url}/assets/${coupon?.image?.filename_disk}`"
                :alt="coupon?.name" />
        </section>
    </div>
</template>

<script setup>
    import {
        ref,
        computed
    } from 'vue';
    import { useRoute } from 'vue-router'

    const route = useRoute()

    const {
        $directus,
        $readItem
    } = useNuxtApp()

    const loadError = ref('')

    const { data: coupon } = await useAsyncData('coupon', async () => {
        try {
            return await $directus.request($readItem('coupons', route.params.id))
        } catch (err) {
            loadError.value = 'Coupon details are unavailable right now.'
            return null
        }
    })

    useHead({
        title: computed(() => coupon.value?.name || 'Coupon Details')
    })
</script>