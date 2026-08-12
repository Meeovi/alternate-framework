<template>
    <div>
        <section data-bs-version="5.1" data-sortbtn="btn-primary">
            <div class="container">
                <div class="row main justify-content-center">
                    <div class="col-lg-12 p-4">
                        <div class="image-element card-wrapper">
                            <NuxtImg class="brandLogo" :src="getAssetURL(shop?.image)" :alt="shop?.name" />
                            <div class="wrapper">
                                <h5 class="card-title mbr-fonts-style align-left display-2" style="color: black;">
                                    {{ shop?.name }}</h5>
                                <div class="collapsed-content">
                                    <div class="mbr-section-btn"><a class="btn btn-md btn-info display-4"
                                            :href="`/outlet/${shop?.slug}`">Visit Shop</a></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { getAssetURL } from '#shared/app/utils/get-asset-url'

    const props = defineProps({
        shop: {
            type: Object,
            required: true,
        },
    });
</script>
