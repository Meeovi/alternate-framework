<template>
    <div>
        <section data-bs-version="5.1" class="header1 cid-txNpxNwJRD mbr-parallax-background" id="header1-4w">



            <div class="mbr-overlay" style="opacity: 0.7; background-color: rgb(53, 53, 53);">
            </div>

            <div class="container text-content">
                <h1 class="mbr-section-title pb-3 mbr-fonts-style mbr-white align-center display-1">{{ introBlock?.name }}</h1>
                <p class="mbr-text pb-3 mbr-fonts-style mbr-white align-center display-7" v-dompurify-html="introBlock?.description"></p>
                <div class="mbr-section-btn pb-5 align-center"><NuxtLink class="btn btn-md btn-danger btn-bgr display-4"
                        :to="introBlock?.content?.[0]?.url || ''">{{introBlock?.content?.[0]?.url_name || 'Take the Tour'}}</NuxtLink></div>
            </div>
            <div class="container mbr-black">
                <div class="row justify-content-center">
                    <div class="box-item col-md-4">
                        <div class="icon-block-top pb-4 align-center">
                            <span class="mbr-iconfont fas fa-cart-shopping display-2"></span>
                        </div>
                        <h2 class="box-item-title pb-3 mbr-fonts-style align-center display-5">{{introBlock?.content?.[1]?.name || ''}}</h2>
                        <p class="box-item-text mbr-fonts-style align-center display-7" v-dompurify-html="introBlock?.content?.[1]?.content"></p>
                    </div>
                    <div class="box-item col-md-4">
                        <div class="icon-block-top pb-4 align-center">
                            <span class="mbr-iconfont fas fa-layer-group display-2"></span>
                        </div>
                        <h2 class="box-item-title pb-3 mbr-fonts-style align-center display-5">{{introBlock?.content?.[2]?.name || ''}}</h2>
                        <p class="box-item-text mbr-fonts-style align-center display-7" v-dompurify-html="introBlock?.content?.[2]?.content"></p>
                    </div>
                    <div class="box-item col-md-4">
                        <div class="icon-block-top pb-4 align-center">
                            <span class="mbr-iconfont fas fa-compass display-2"></span>
                        </div>
                        <h2 class="box-item-title pb-3 mbr-fonts-style align-center display-5">{{introBlock?.content?.[3]?.name || ''}}</h2>
                        <p class="box-item-text mbr-fonts-style align-center display-7" v-dompurify-html="introBlock?.content?.[3]?.content"></p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
  import { reuseServerData } from '#shared/app/utils/reuseServerData'
    const { $directus, $readItem, $readItems } = useNuxtApp()

    import { getAssetURL } from '#shared/app/utils/get-asset-url'

    // lazy: true — see headerslider.vue's comment on the same pattern.
    const {
        data: introBlock
    } = useAsyncData('introBlock', async () => {
        try {
        const resp = await $directus.request($readItem('page_blocks', '26', {
                fields: ['*', 'media.*.*'],
        }))
        return resp?.data || resp || null
        } catch {
            return null
        }
    }, { getCachedData: reuseServerData, lazy: true })
</script>