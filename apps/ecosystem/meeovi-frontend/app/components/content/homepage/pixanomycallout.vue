<template>
    <!-- Pixanomy, Meeovi's department for images and artwork: its newest
         products, then notes and spaces about it. -->
    <div v-if="products.length">
        <section data-bs-version="5.1" class="pricing6 shopm5 cid-tZPDtxeZjg" id="apricing6-69"
            data-sortbtn="btn-primary">

            <div class="container-fluid">
                <div class="row align-items-stretch items-row justify-content-center">

                    <div class="col-12 col-md-12 col-lg-4">
                        <div class="mbr-section-head">
                            <h2 class="mbr-section-title mbr-fonts-style mb-0 display-7">
                                <strong>Pixanomy</strong>
                            </h2>
                            <h3 class="mbr-section-subtitle mbr-fonts-style mb-0 display-2">
                                <strong>Images &amp; Artwork</strong>
                            </h3>
                            <h3 class="main-text mbr-fonts-style mb-0 display-7">
                                Photography, art, stock images, icons, fonts and memes from Meeovi's creators.
                            </h3>
                            <div class="mbr-section-btn item-footer">
                                <NuxtLink to="/departments/pixanomy" class="btn btn-danger item-btn display-7">
                                    <span class="mobi-mbri mobi-mbri-arrow-next mbr-iconfont mbr-iconfont-btn"></span>
                                    Explore Pixanomy
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-12 col-lg-8 pixanomy-products">
                        <v-slide-group class="py-4 px-sm-4" show-arrows>
                            <v-slide-group-item v-for="product in products" :key="product.id">
                                <productCard :product="product" class="ma-2" />
                            </v-slide-group-item>
                        </v-slide-group>
                    </div>
                </div>

                <!-- Notes, lists, events and spaces about Pixanomy (loads when scrolled near). -->
                <TopicActivity v-if="departmentId" :department-id="departmentId" class="pixanomy-topic" />
            </div>
        </section>
    </div>
</template>

<script setup>
    import { computed } from 'vue'
    import { reuseServerData } from '#shared/app/utils/reuseServerData'
    import productCard from '#commerce/app/components/catalog/product/productCard.vue'
    import TopicActivity from '#social/app/components/related/topicActivity.vue'

    const { data } = useAsyncData('home-pixanomy', () => $fetch('/api/commerce/home/pixanomy'),
        { getCachedData: reuseServerData, lazy: true, default: () => null })

    const products = computed(() => data.value?.products ?? [])
    const departmentId = computed(() => data.value?.departmentId ?? null)
</script>

<style scoped>
.cid-tZPDtxeZjg {
    background-color: green !important;
}

.cid-tZPDtxeZjg .mbr-section-head {
    background-color: transparent !important;
    color: white !important;
}

.pixanomy-products {
    display: flex;
    align-items: center;
    min-width: 0;
}

.pixanomy-products :deep(.v-slide-group) {
    width: 100%;
}

/* The topic rows' headings sit on the green too. */
.pixanomy-topic :deep(.v-toolbar-title) {
    color: white;
}
</style>
