<template>
    <div>
        <div v-if="restaurant">
            <section data-bs-version="5.1" class="features01 stockm5 cid-uwd9RxG0Y8" id="features01-aa">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="title-wrapper">
                                <div class="desc-wrapper">
                                    <p class="mbr-desc mbr-fonts-style display-4">
                                        Restaurants
                                    </p>
                                </div>
                                <div class="title-wrap">
                                    <h2 class="mbr-section-title mbr-fonts-style display-2">
                                        <strong><span><b>Great Tastes</b></span> near you!</strong>
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row items-wrapper">
                        <div class="item features-image col-12 col-lg-4">
                            <div class="item-wrapper">
                                <div class="item-img">
                                    <NuxtLink :to="`/shops/${restaurant?.id}`"><img loading="lazy" class="align-end text-white" v-if="restaurant?.image"
                            :src="`${$directus.url}assets/${restaurant?.image?.filename_disk}`" :alt="restaurant?.name"></NuxtLink>
                                </div>
                                <div class="item-content">
                                    <div class="desc-wrap">
                                        <p class="item-desc desc_1 mbr-fonts-style display-4">
                                            {{ restaurant?.food_offered }}
                                        </p>
                                    </div>
                                    <h4 class="item-title mbr-fonts-style display-5">
                                        <strong>{{ restaurant?.name }}</strong>
                                    </h4>
                                    <p class="item-text mbr-fonts-style display-4" v-dompurify-html="restaurant?.description"></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <p v-else>No restaurants found.</p>
    </div>
</template>

<script setup>
    import {
        useRuntimeConfig
    } from '#imports';

    const config = useRuntimeConfig();
    const props = defineProps({
        restaurant: {
            type: Object,
            required: true,
        },
    });

    const {
        restaurant
    } = props;
</script>