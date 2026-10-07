<template>
    <!-- Signed-in users only: /api/assets/mine is auth-gated, so for guests the
         request 401s, `media` stays null and nothing renders. -->
    <div v-if="media">
        <section data-bs-version="5.1" class="pricing6 shopm5 cid-tZPDtxeZjg" id="apricing6-69"
            data-sortbtn="btn-primary">

            <div class="container-fluid">
                <div class="row align-items-stretch items-row justify-content-center">

                    <div class="col-12 col-md-12 col-lg-5">
                        <div class="mbr-section-head">
                            <h4 class="mbr-section-title mbr-fonts-style mb-0 display-7">
                                <strong>Your Pixanomy</strong>
                            </h4>
                            <h5 class="mbr-section-subtitle mbr-fonts-style mb-0 display-2">
                                <strong>Your Media</strong>
                            </h5>
                            <h5 class="main-text mbr-fonts-style mb-0 display-7">
                                Your latest photos and videos, stored on Pixanomy.
                            </h5>
                            <div class="mbr-section-btn item-footer">
                                <a href="https://app.pixanomy.com" class="btn btn-danger item-btn display-7"
                                    target="_blank" rel="noopener">
                                    <span class="mobi-mbri mobi-mbri-arrow-next mbr-iconfont mbr-iconfont-btn"></span>
                                    Access your Media
                                </a>
                            </div>
                        </div>
                    </div>

                    <div class="col-12 col-md-12 col-lg-7 pixanomy-media">
                        <v-slide-group v-if="media.length" class="py-4 px-sm-4">
                            <v-slide-group-item v-for="asset in media" :key="asset.fileId || asset.url">
                                <a :href="asset.shareUrl" target="_blank" rel="noopener" class="pixanomy-media__tile ma-2"
                                    :title="asset.filename">
                                    <video v-if="isVideo(asset)" :src="`${asset.url}#t=0.1`" muted playsinline
                                        preload="metadata" />
                                    <img v-else :src="asset.url" :alt="asset.filename" loading="lazy">
                                    <span v-if="isVideo(asset)" class="pixanomy-media__play">
                                        <v-icon icon="fas fa-play" size="small" />
                                    </span>
                                </a>
                            </v-slide-group-item>
                        </v-slide-group>

                        <p v-else class="pixanomy-media__empty">
                            You haven't added any photos or videos yet. Anything you upload on Meeovi appears here.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
    // server: false — personal media shouldn't be rendered into (or cached in)
    // the shared SSR HTML; the section simply appears once the user's own
    // request resolves. A guest gets a 401, which leaves `media` null.
    const { data } = useFetch('/api/assets/mine', {
        query: { limit: 12 },
        server: false,
        lazy: true,
        key: 'pixanomyCalloutMedia',
    })

    const media = computed(() => data.value?.assets ?? null)
    const isVideo = (asset) => String(asset?.contentType || '').startsWith('video/')
</script>

<style scoped>
.cid-tZPDtxeZjg {
    background-color: green !important;
}

.cid-tZPDtxeZjg .mbr-section-head {
    background-color: transparent !important;
    color: white !important;
}

.pixanomy-media {
    display: flex;
    align-items: center;
    min-width: 0;
}

.pixanomy-media :deep(.v-slide-group) {
    width: 100%;
}

.pixanomy-media__tile {
    position: relative;
    display: block;
    width: 180px;
    height: 180px;
    border-radius: 12px;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.25);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
}

.pixanomy-media__tile img,
.pixanomy-media__tile video {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.pixanomy-media__play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.55);
    color: white;
    pointer-events: none;
}

.pixanomy-media__empty {
    color: white;
    margin: 1rem 0;
}
</style>
